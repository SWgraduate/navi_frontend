"use client";

import { useState, useEffect } from "react";
import { getMyProfile, type StudentResponse } from "@/lib/api/student";

type ProfileState = {
  profile: StudentResponse | null;
  isLoading: boolean;
  error: Error | null;
};

// 모듈 레벨 캐시: 같은 세션 내 /my 재진입 시 API 재요청 없이 즉시 반환
let profileCache: StudentResponse | null = null;
// 동시 마운트 시 중복 요청 방지용 inflight promise
let inflightPromise: Promise<StudentResponse | null> | null = null;

/** 프로필 캐시 갱신 (upsert 성공 후 호출) */
export function updateProfileCache(updated: StudentResponse): void {
  profileCache = updated;
}

/** 프로필 캐시 초기화 (로그아웃/탈퇴 시 호출) */
export function clearProfileCache(): void {
  profileCache = null;
  inflightPromise = null;
}

export function useProfile(): ProfileState {
  const [state, setState] = useState<ProfileState>({
    profile: profileCache,
    isLoading: profileCache === null,
    error: null,
  });

  useEffect(() => {
    if (profileCache !== null) return;

    if (!inflightPromise) {
      inflightPromise = getMyProfile()
        .then((data) => {
          if (data && typeof data === "object" && "statusCode" in data) {
            inflightPromise = null;
            return null;
          }
          profileCache = data as StudentResponse;
          return profileCache;
        })
        .catch(() => {
          inflightPromise = null;
          return null;
        });
    }

    inflightPromise.then((profile) => {
      setState({
        profile,
        isLoading: false,
        error: profile ? null : new Error("프로필을 불러올 수 없습니다."),
      });
    });
  }, []);

  return state;
}
