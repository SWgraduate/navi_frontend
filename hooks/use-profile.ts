"use client";

import { useState, useEffect } from "react";
import { getMyProfile, type StudentResponse } from "@/lib/api/student";

type ProfileState = {
  profile: StudentResponse | null;
  isLoading: boolean;
  error: Error | null;
};

export function useProfile(): ProfileState {
  const [state, setState] = useState<ProfileState>({
    profile: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    getMyProfile()
      .then((data) => {
        if (data && typeof data === "object" && "statusCode" in data) {
          setState({ profile: null, isLoading: false, error: new Error("프로필을 불러올 수 없습니다.") });
        } else {
          setState({ profile: data as StudentResponse, isLoading: false, error: null });
        }
      })
      .catch((err: unknown) => {
        setState({
          profile: null,
          isLoading: false,
          error: err instanceof Error ? err : new Error("프로필을 불러올 수 없습니다."),
        });
      });
  }, []);

  return state;
}
