"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const BAR_COUNT = 10;
const MIN_HEIGHT = 4;
const MAX_HEIGHT = 24;
const SENSITIVITY_DIVISOR = 48; // 낮을수록 민감 (기본 128 → 48)

/**
 * 마이크 권한 획득 및 음성 분석 훅
 *
 * ## 모바일에서 권한 팝업이 안 나오는 경우
 * iOS Safari 등은 "사용자 제스처(탭/클릭)" 직후에만 getUserMedia 호출을 허용합니다.
 * 페이지 로드 시 useEffect에서 호출하면 팝업이 뜨지 않을 수 있으므로,
 * requestPermission()을 **반드시 버튼/영역 탭 핸들러 안에서** 호출하세요.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 */
export function useVoiceAnalyser(active: boolean) {
  const [barHeights, setBarHeights] = useState<number[]>(
    () => Array(BAR_COUNT).fill(MIN_HEIGHT)
  );
  const [audioLevel, setAudioLevel] = useState(0); // 0~100, 음성 수신 확인용
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
  const cancelledRef = useRef(false);

  const setupAudio = useCallback(async () => {
    resumeTriedRef.current = false;
    setPermissionState("requesting");
    setErrorMessage(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setPermissionState("error");
      setErrorMessage(
        "이 브라우저에서는 마이크를 사용할 수 없습니다. HTTPS 환경에서 접속해주세요."
      );
      return;
    }

    try {
      // 모바일: 이 호출이 반드시 사용자 탭/클릭 핸들러 직후에 실행되어야 팝업이 뜸
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (cancelledRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.5;
      analyser.minDecibels = -50;
      analyser.maxDecibels = 0;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      setPermissionState("granted");

      function updateBars() {
        if (
          cancelledRef.current ||
          !analyserRef.current ||
          !dataArrayRef.current
        )
          return;

        const ctx = audioContextRef.current;
        if (ctx?.state === "suspended" && !resumeTriedRef.current) {
          resumeTriedRef.current = true;
          ctx.resume();
        }

        analyserRef.current.getByteFrequencyData(
          dataArrayRef.current as Uint8Array<ArrayBuffer>
        );

        const binSize = Math.floor(bufferLength / BAR_COUNT);
        let totalSum = 0;
        const heights = Array.from({ length: BAR_COUNT }, (_, i) => {
          const start = i * binSize;
          let sum = 0;
          for (let j = 0; j < binSize; j++) {
            sum += dataArrayRef.current![start + j];
          }
          totalSum += sum;
          const avg = sum / binSize;
          const normalized = Math.min(1, avg / SENSITIVITY_DIVISOR);
          return MIN_HEIGHT + normalized * (MAX_HEIGHT - MIN_HEIGHT);
        });

        const avgLevel = totalSum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((avgLevel / 255) * 100)));
        setBarHeights(heights);
        animationFrameRef.current = requestAnimationFrame(updateBars);
      }

      updateBars();
    } catch (err) {
      if (cancelledRef.current) return;

      const message =
        err instanceof Error ? err.message : "마이크 접근에 실패했습니다";
      setErrorMessage(message);
      setPermissionState(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "denied"
          : "error"
      );
    }
  }, []);

  // active가 false가 되면 정리만 수행. 권한 요청은 requestPermission() 호출 시에만 수행
  useEffect(() => {
    if (!active) {
      cancelledRef.current = true;
      setBarHeights(Array(BAR_COUNT).fill(MIN_HEIGHT));
      setAudioLevel(0);
      setPermissionState("idle");
      setErrorMessage(null);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      analyserRef.current = null;
      audioContextRef.current?.close();
      audioContextRef.current = null;
      return;
    }
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
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

  const requestPermission = useCallback(() => {
    if (!active || permissionState === "granted" || permissionState === "requesting")
      return;
    setupAudio();
  }, [active, permissionState, setupAudio]);

  return { barHeights, audioLevel, permissionState, errorMessage, requestPermission };
}
