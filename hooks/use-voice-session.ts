"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createVoiceSession } from "@/lib/api/chat";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function toWsUrl(wsUrl: string): string {
  if (wsUrl.startsWith("ws://") || wsUrl.startsWith("wss://")) return wsUrl;
  const origin = new URL(API_BASE).origin;
  const wsOrigin = origin.replace(/^http/, "ws");
  const path = wsUrl.startsWith("/") ? wsUrl : `/${wsUrl}`;
  return `${wsOrigin}${path}`;
}

function float32ToInt16(float32: Float32Array): ArrayBuffer {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    int16[i] = Math.max(-32768, Math.min(32767, Math.round(float32[i] * 32767)));
  }
  return int16.buffer;
}

export type VoiceSessionStatus = "idle" | "connecting" | "connected" | "error" | "closed";

export interface SubtitleLine {
  text: string;
  type: "stt" | "tts";
}

export interface VoiceSessionState {
  status: VoiceSessionStatus;
  sttTranscript: string;
  sttIsFinal: boolean;
  ttsText: string;
  pastLines: SubtitleLine[];
  error: string | null;
}

/**
 * Voice Session WebSocket 훅
 *
 * - active=true 시: 세션 토큰 발급 → WebSocket 연결 → 마이크 스트리밍 (PCM 16-bit Mono 16kHz)
 * - 수신 binary(MP3): 청크 누적 → 300ms 무음 후 AudioContext로 디코딩 재생
 * - 수신 JSON: stt/tts 이벤트 상태 반환
 */
export interface VoiceSessionReturn extends VoiceSessionState {
  unlockAudio: () => void;
}

export function useVoiceSession(chatId: string | null, active: boolean): VoiceSessionReturn {
  const [state, setState] = useState<VoiceSessionState>({
    status: "idle",
    sttTranscript: "",
    sttIsFinal: false,
    ttsText: "",
    pastLines: [],
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const micContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // TTS 오디오 재생용
  const playContextRef = useRef<AudioContext | null>(null);
  const ttsChunksRef = useRef<Uint8Array[]>([]);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  // TTS 재생 중 마이크 음소거용: 재생 인스턴스 카운터로 마지막 소스만 unmute 트리거
  const isTtsActiveRef = useRef<boolean>(false);
  const ttsPlayCountRef = useRef<number>(0);

  useEffect(() => {
    if (!active || !chatId) {
      cleanup();
      setState({ status: "idle", sttTranscript: "", sttIsFinal: false, ttsText: "", pastLines: [], error: null });
      return;
    }

    let cancelled = false;

    /** 누적된 MP3 청크를 AudioContext로 디코딩 후 순서대로 재생 */
    async function flushTtsChunks() {
      const chunks = ttsChunksRef.current.splice(0);
      if (chunks.length === 0) return;

      const ctx = playContextRef.current;
      if (!ctx) return;

      // suspended 상태면 resume 후 진행 (autoplay 정책 대응)
      if (ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch (e) {
          console.warn("[VoiceSession] AudioContext resume failed", e);
          return;
        }
      }

      const totalLen = chunks.reduce((s, c) => s + c.length, 0);
      const combined = new Uint8Array(totalLen);
      let offset = 0;
      for (const c of chunks) { combined.set(c, offset); offset += c.length; }

      console.log(`[VoiceSession] flush ${chunks.length} chunks, ${totalLen} bytes, ctx.state=${ctx.state}`);

      try {
        const audioBuffer = await ctx.decodeAudioData(combined.buffer.slice(0));
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);

        // 이전 청크 재생 끝난 직후부터 연속 재생
        const startAt = Math.max(ctx.currentTime, nextPlayTimeRef.current);
        source.start(startAt);
        nextPlayTimeRef.current = startAt + audioBuffer.duration;

        // TTS 재생 중 마이크 음소거
        isTtsActiveRef.current = true;
        ttsPlayCountRef.current++;
        const thisCount = ttsPlayCountRef.current;
        source.onended = () => {
          if (ttsPlayCountRef.current === thisCount) {
            isTtsActiveRef.current = false;
          }
        };
      } catch (e) {
        console.warn("[VoiceSession] TTS decode failed", e);
      }
    }

    /** 새 청크 도착 시 타이머 재설정 (300ms 내 새 청크 없으면 재생) */
    function scheduleTtsPlay() {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
      playTimerRef.current = setTimeout(() => {
        flushTtsChunks();
      }, 300);
    }

    async function startMicrophone() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = stream;

      const TARGET_SR = 16000;
      const ctx = new AudioContext();
      micContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;
        if (isTtsActiveRef.current) return; // TTS 재생 중 마이크 음소거
        const input = e.inputBuffer.getChannelData(0);
        const inputRate = ctx.sampleRate;
        let samples: Float32Array;
        if (inputRate === TARGET_SR) {
          samples = input;
        } else {
          const ratio = inputRate / TARGET_SR;
          const outLen = Math.round(input.length / ratio);
          samples = new Float32Array(outLen);
          for (let i = 0; i < outLen; i++) samples[i] = input[Math.round(i * ratio)];
        }
        wsRef.current.send(float32ToInt16(samples));
      };

      source.connect(processor);
      processor.connect(ctx.destination);
    }

    async function start() {
      setState((s) => ({ ...s, status: "connecting", error: null }));

      // 재생용 AudioContext: unlockAudio()로 미리 생성된 경우 재사용, 없으면 새로 생성
      if (!playContextRef.current) {
        playContextRef.current = new AudioContext();
      }
      nextPlayTimeRef.current = 0;

      try {
        const { wsUrl } = await createVoiceSession(chatId!);
        if (cancelled) return;

        const fullWsUrl = toWsUrl(wsUrl);
        console.log("[VoiceSession]", wsUrl, "→", fullWsUrl);
        const ws = new WebSocket(fullWsUrl);
        wsRef.current = ws;
        ws.binaryType = "arraybuffer";

        ws.onopen = async () => {
          if (cancelled) { ws.close(); return; }
          setState((s) => ({ ...s, status: "connected" }));
          // AudioContext resume (autoplay 정책 대응)
          playContextRef.current?.resume().catch(() => {});
          try {
            await startMicrophone();
          } catch {
            setState((s) => ({ ...s, status: "error", error: "마이크에 접근할 수 없습니다." }));
          }
        };

        ws.onmessage = (event) => {
          if (event.data instanceof ArrayBuffer) {
            console.log(`[VoiceSession] binary chunk received: ${event.data.byteLength} bytes`);
            ttsChunksRef.current.push(new Uint8Array(event.data));
            scheduleTtsPlay();
          } else if (typeof event.data === "string") {
            try {
              const msg = JSON.parse(event.data) as
                | { type: "stt"; transcript: string; isFinal: boolean }
                | { type: "tts"; text: string };
              if (msg.type === "stt") {
                setState((s) => {
                  const next: VoiceSessionState = { ...s, sttTranscript: msg.transcript, sttIsFinal: msg.isFinal };
                  if (msg.isFinal && msg.transcript && !s.sttIsFinal) {
                    next.pastLines = [...s.pastLines, { text: msg.transcript, type: "stt" }];
                  }
                  return next;
                });
              } else if (msg.type === "tts") {
                setState((s) => ({
                  ...s,
                  ttsText: msg.text,
                  pastLines: [...s.pastLines, { text: msg.text, type: "tts" }],
                }));
                // tts 이벤트 수신 즉시 타이머 해제 후 바로 재생 시도
                if (playTimerRef.current) clearTimeout(playTimerRef.current);
                flushTtsChunks();
                // Web Speech API fallback: 서버 바이너리 오디오가 없을 때 브라우저 TTS로 대체
                if (typeof window !== "undefined" && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  // 텍스트에 포함된 문자로 언어 감지
                  // \uAC00-\uD7A3: 한글 음절(가~힣), \u4E00-\u9FFF\u3400-\u4DBF: CJK 한자(중국어)
                  const lang = /[\uAC00-\uD7A3]/.test(msg.text)
                    ? "ko-KR"
                    : /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(msg.text)
                      ? "zh-CN"
                      : "en-US";
                  const utter = new SpeechSynthesisUtterance(msg.text);
                  utter.lang = lang;
                  utter.rate = 1.1;
                  // 언어별 선호 음성 목록 (자연스러운 여성 음성 우선)
                  // 목록 순서대로 시도하며, 없으면 해당 언어의 첫 번째 음성으로 폴백
                  const preferred: Record<string, string[]> = {
                    "ko-KR": ["Yuna"],                                          // iOS
                    "en-US": ["Samantha", "Karen", "Moira", "Google US English"], // iOS / Android
                    "zh-CN": ["Ting-Ting", "Google 普通话（中国大陆）"],            // iOS / Android
                  };
                  const voices = window.speechSynthesis.getVoices();
                  // lang 완전 일치 우선, 없으면 언어 코드 앞부분(예: "en")만 맞는 음성 포함
                  const candidates = voices.filter(v => v.lang === lang || v.lang.startsWith(lang.split("-")[0]));
                  const picked = (preferred[lang] ?? [])
                    .map(name => candidates.find(v => v.name === name))
                    .find(Boolean) ?? candidates[0];
                  if (picked) utter.voice = picked;
                  utter.onstart = () => { isTtsActiveRef.current = true; };
                  utter.onend = () => { isTtsActiveRef.current = false; };
                  window.speechSynthesis.speak(utter);
                }
              }
            } catch { /* 파싱 불가 무시 */ }
          }
        };

        ws.onerror = (e) => {
          if (cancelled) return;
          console.error("[VoiceSession] ws.onerror", e);
          setState((s) => ({ ...s, status: "error", error: "WebSocket 연결 오류가 발생했습니다." }));
        };

        ws.onclose = (event) => {
          console.log("[VoiceSession] onclose", event.code, event.reason);
          if (cancelled) return;
          // 세션 종료 시 남은 청크 재생
          if (ttsChunksRef.current.length > 0) flushTtsChunks();
          if (event.code === 1008) {
            setState((s) => ({ ...s, status: "error", error: "세션 토큰이 유효하지 않습니다." }));
          } else if (event.code !== 1000) {
            setState((s) => ({
              ...s,
              status: "error",
              error: `연결이 끊겼습니다. (${event.code}${event.reason ? ": " + event.reason : ""})`,
            }));
          } else {
            setState((s) => ({ ...s, status: "closed" }));
          }
        };
      } catch (err) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          status: "error",
          error: err instanceof Error ? err.message : "음성 세션을 시작할 수 없습니다.",
        }));
      }
    }

    // StrictMode 이중 실행 방지: cleanup이 먼저 실행되면 타이머 취소로 연결 차단
    const startTimer = setTimeout(() => {
      if (!cancelled) start();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      cleanup();
    };
  }, [active, chatId]);

  /** 마이크 버튼 탭 직후(사용자 제스처 컨텍스트)에서 호출해 AudioContext + speechSynthesis 잠금 해제 */
  const unlockAudio = useCallback(() => {
    if (!playContextRef.current) {
      playContextRef.current = new AudioContext();
      nextPlayTimeRef.current = 0;
    }
    const ctx = playContextRef.current;
    ctx.resume().catch(() => {});

    // 무음 버퍼 재생 → 모바일 브라우저 AudioContext 완전 unlock
    const silentBuf = ctx.createBuffer(1, 1, 22050);
    const silentSrc = ctx.createBufferSource();
    silentSrc.buffer = silentBuf;
    silentSrc.connect(ctx.destination);
    silentSrc.start();

    // speechSynthesis unlock (iOS Safari 포함)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    }
  }, []);

  function cleanup() {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    if (playTimerRef.current) { clearTimeout(playTimerRef.current); playTimerRef.current = null; }
    ttsChunksRef.current = [];
    nextPlayTimeRef.current = 0;
    isTtsActiveRef.current = false;
    ttsPlayCountRef.current = 0;

    wsRef.current?.close();
    wsRef.current = null;

    processorRef.current?.disconnect();
    processorRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    micContextRef.current?.close();
    micContextRef.current = null;

    playContextRef.current?.close();
    playContextRef.current = null;
  }

  return { ...state, unlockAudio };
}
