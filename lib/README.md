# lib/ 캐싱 유틸리티

이 폴더의 `*-storage.ts` 파일들은 브라우저 localStorage를 추상화한 유틸리티입니다.

---

## 사용 중인 localStorage 키 목록

> **주의**: 새로운 localStorage 키를 추가할 때는 반드시 이 파일을 업데이트하세요.

| 키 | 파일 | 타입 | 초기화 조건 |
|---|---|---|---|
| `navi_logged_in` | `auth-storage.ts` | `"1"` \| 없음 | 로그아웃 / `setLoggedIn(false)` |
| `navi_access_token` | `auth-storage.ts` | JWT 문자열 | 401 응답 / 로그아웃 |
| `navi_email` | `auth-storage.ts` | 이메일 문자열 | 로그아웃 |
| `navi_user_id` | `auth-storage.ts` | ID 문자열 | 로그아웃 |
| `navi_user_role` | `auth-storage.ts` | role 문자열 | 로그아웃 |
| `navi_language` | `i18n-storage.ts` | `"ko"` \| `"en"` \| `"zh"` | 사용자가 직접 변경 |
| `navi_history_pins` | `history-storage.ts` | JSON (Record\<string, boolean\>) | 사용자가 핀 토글 |
| `navi_graduation_result` | `mock-accounts.ts` | JSON (GraduationResultData) | `clearGraduationResult()` 호출 |
| `signup_verify_resend` | `app/signup/verify/page.tsx` | JSON (`{date, count}`) | 날짜가 바뀌면 자동 초기화 |
| `signup_verify_locked_until` | `app/signup/verify/page.tsx` | 타임스탬프(ms) | 24시간 경과 후 자동 해제 |

---

## auth-storage.ts

인증 관련 데이터를 localStorage에서 관리합니다.

### 주요 동작

- `setLoggedIn(false)` 호출 시 `navi_access_token`, `navi_logged_in`, `navi_email`, `navi_user_id`, `navi_user_role` **모두 삭제**됩니다.
- API 클라이언트(`lib/api/client.ts`)는 매 요청마다 `navi_access_token`을 localStorage에서 읽어 `Authorization: Bearer` 헤더에 자동 추가합니다.
- **401 응답** 시 `client.ts`에서 `navi_access_token`과 `navi_logged_in`을 삭제하고 `/login`으로 강제 리다이렉트합니다.

### 주의사항

- SSR 환경에서는 `typeof window !== "undefined"` 체크 후 접근해야 합니다 (client.ts에서 이미 처리).
- 로그아웃 로직은 반드시 `setLoggedIn(false)`를 통해 처리하세요. 개별 키를 직접 삭제하면 누락이 생길 수 있습니다.

---

## i18n-storage.ts

언어 설정을 localStorage에 저장하며, `contexts/i18n-context.tsx`와 함께 동작합니다.

### 주요 동작

- 기본값은 `"ko"` (저장된 값이 없거나 유효하지 않을 때).
- 언어 변경 시 `i18n-context.tsx`가 `setStoredLanguage()` → i18next `changeLanguage()` → `<html lang>` 속성 업데이트를 순서대로 실행합니다.

---

## history-storage.ts

채팅 히스토리의 핀 고정 상태를 localStorage에 저장합니다.

### 주요 동작

- `navi_history_pins`는 `{ [chatId]: true }` 형태의 JSON 객체입니다.
- `getPinnedMap()`은 JSON 파싱 실패 시 빈 객체 `{}`를 반환합니다 (예외 없음).

---

## mock-accounts.ts (졸업사정 결과 캐싱)

이름과 달리 졸업사정조회 결과를 localStorage에 캐싱하는 함수들이 포함되어 있습니다.

### GraduationResultData 구조

```typescript
type GraduationResultData = {
  type: "BASIC" | "DOUBLE" | "MICRO";
  credits: Record<CreditKey, string>;
}
```

### 주요 동작

- `getGraduationResult()` — 저장된 결과 조회, 없으면 `null`.
- `setGraduationResult(data)` — 결과 저장 (새로 업로드할 때마다 덮어씀).
- `clearGraduationResult()` — 결과 삭제.
- `hasGraduationResult()` — 결과 존재 여부 확인.

### 주의사항

- 졸업사정 결과는 서버에서도 관리되지만, 빠른 UI 표시를 위해 localStorage에도 캐싱합니다.
- 졸업 PDF를 새로 업로드하면 반드시 `setGraduationResult()`로 결과를 갱신해야 합니다.
