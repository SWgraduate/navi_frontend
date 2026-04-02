"use client";

import { useEffect, useRef, useState } from "react";

const VOICE_THRESHOLD = 15; // 이 값 초과 시 음성 감지

/** Figma 1460-5250: 파도 형태 (좌측 낮음 → 중앙 피크 → 우측 낮음) */
const WAVE_HEIGHTS = [4, 8, 16, 24, 16, 12, 8, 4, 4];

/**
 * 마이크 권한 획득 및 음성 분석 훅
 *
 * ## 마이크 권한 획득 방법
 * 1. `navigator.mediaDevices.getUserMedia({ audio: true })` 호출 시 브라우저가 사용자에게 권한 요청
 * 2. HTTPS 또는 localhost에서만 동작 (보안 정책)
 * 3. 사용자가 허용하면 MediaStream 반환, 거부하면 NotAllowedError
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 */
export function useVoiceAnalyser(active: boolean) {
  const [wavePulse, setWavePulse] = useState(0); // 음성 감지 시마다 증가 → 1회 나타났다 사라지는 애니메이션 트리거
  const [audioLevel, setAudioLevel] = useState(0);
  const [bandLevels, setBandLevels] = useState<number[]>(() => Array(16).fill(0));
  const [permissionState, setPermissionState] = useState<
    "idle" | "requesting" | "granted" | "denied" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const resumeTriedRef = useRef(false);
  const wasAboveThresholdRef = useRef(false);

  useEffect(() => {
    if (!active) {
      queueMicrotask(() => {
        setWavePulse(0);
        setAudioLevel(0);
        setPermissionState("idle");
        setErrorMessage(null);
      });
      return;
    }

    let cancelled = false;

    async function setupAudio() {
      resumeTriedRef.current = false;
      setPermissionState("requesting");
      setErrorMessage(null);

      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setPermissionState("error");
        setErrorMessage(
          "이 브라우저에서는 마이크를 사용할 수 없습니다. HTTPS 환경에서 접속해주세요."
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        // 브라우저가 AudioContext를 suspended 상태로 시작할 수 있음 → resume 필수
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.3;
        analyser.minDecibels = -80; // -50 → -80: 조용한 음성도 포착
        analyser.maxDecibels = -10; // 0 → -10: 피크 클리핑 완화
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;

        setPermissionState("granted");

        function updateBars() {
          if (cancelled || !analyserRef.current || !dataArrayRef.current) return;

          // 일부 브라우저가 콜백 내에서 suspended 상태로 시작 → resume 1회 시도
          const ctx = audioContextRef.current;
          if (ctx?.state === "suspended" && !resumeTriedRef.current) {
            resumeTriedRef.current = true;
            ctx.resume();
          }

          analyserRef.current.getByteFrequencyData(
            dataArrayRef.current as Uint8Array<ArrayBuffer>
          );

          const data = dataArrayRef.current;
          const bufferLength = analyserRef.current.frequencyBinCount;

          const speechBinCount = Math.min(256, Math.floor(bufferLength / 2));
          let maxLevel = 0;
          for (let i = 0; i < speechBinCount; i++) {
            const v = data[i];
            if (v > maxLevel) maxLevel = v;
          }

          setAudioLevel(Math.min(100, Math.round((maxLevel / 255) * 100)));

          // 시각화용 16개 대역별 평균값 계산 (실제 스펙트럼 느낌 유지)
          const bands = 16;
          const bandSize = Math.max(1, Math.floor(speechBinCount / bands));
          const nextBandLevels: number[] = [];
          for (let b = 0; b < bands; b++) {
            const start = b * bandSize;
            const end = Math.min(speechBinCount, start + bandSize);
            let sum = 0;
            let count = 0;
            for (let i = start; i < end; i++) {
              sum += data[i];
              count += 1;
            }
            const avg = count > 0 ? sum / count : 0;
            const normalized = Math.min(100, Math.round((avg / 255) * 100));
            nextBandLevels.push(normalized);
          }
          setBandLevels(nextBandLevels);

          // 음성 "시작" 시점에만 1회 트리거 (아래→위로 넘을 때만, 연속 감지 시 반복 방지)
          const isAbove = maxLevel > VOICE_THRESHOLD;
          if (isAbove && !wasAboveThresholdRef.current) {
            wasAboveThresholdRef.current = true;
            setWavePulse((p) => p + 1);
          } else if (!isAbove) {
            wasAboveThresholdRef.current = false;
          }
          animationFrameRef.current = requestAnimationFrame(updateBars);
        }

        updateBars();
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : "마이크 접근에 실패했습니다";
        setErrorMessage(message);
        setPermissionState(
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "denied"
            : "error"
        );
      }
    }

    setupAudio();

    return () => {
      cancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      analyserRef.current = null;
      audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, [active]);

  return {
    wavePulse,
    waveHeights: WAVE_HEIGHTS,
    audioLevel,
    bandLevels,
    permissionState,
    errorMessage,
  };
}
