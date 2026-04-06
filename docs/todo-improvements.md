# 개선 필요 사항 (우선순위별)

> 작성일: 2026-04-06

---

## Critical — 즉시 수정 (보안 / 핵심 기능)

### 1. 비밀번호 평문 sessionStorage 잔존

**파일:** `app/signup/complete/page.tsx`

회원가입 완료 후 `signup_password`, `signup_email`, `signup_name`이 sessionStorage에서 삭제되지 않아 평문 비밀번호가 세션 내내 남아 있음.

**해결:** `register()` API 호출 성공 후 sessionStorage 항목 삭제.

```ts
// register() 성공 콜백 안에 추가
sessionStorage.removeItem("signup_email");
sessionStorage.removeItem("signup_name");
sessionStorage.removeItem("signup_password");
```

---

### 2. 세션 체크 미구현 (TODO 3곳)

**파일:** `app/page.tsx:14,18` / `app/home/page.tsx:17` / `app/language-onboarding/page.tsx:33`

백엔드에 `GET /auth/me` 엔드포인트가 없어 세션 유효성 검증을 건너뜀. 로그인된 사용자도 앱 재진입 시 `/login`으로 떨어짐.

**해결:** 백엔드에 `GET /auth/me` 추가 후 각 TODO 주석 아래 복구 코드를 활성화.

```ts
// lib/api/auth.ts에 추가
export async function getMe() {
  return apiFetch<{ id: string }>("/auth/me");
}

// app/page.tsx — 스플래시에서 로그인 상태 분기
const user = await getMe().catch(() => null);
if (user) redirect("/home");
```

---

### 3. Route Guard 없음

**파일:** 전체 앱 (특히 `/home`, `/graduation`, `/my`)

인증 필요 페이지에 비로그인 상태로 직접 URL 접근 가능. API 호출 전까지 보호 없음.

**해결:** `middleware.ts`를 프로젝트 루트에 생성해 토큰 유무로 리다이렉트.

```ts
// middleware.ts (프로젝트 루트)
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/language-onboarding"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("navi_access_token")?.value;
  const isPublic = PUBLIC_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));
  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = { matcher: ["/((?!_next|icons|images|api).*)"] };
```

> 주의: 현재 토큰을 localStorage에 저장하므로 middleware에서 읽으려면 쿠키로 이전하거나, 서버 대신 클라이언트에서 가드 처리하는 방식으로 구현해야 함.

---

## Major — 단기 개선 (기능 미완성 / UX 저하)

### 4. 에러 메시지 i18n 미적용

**파일:** `contexts/chat-context.tsx` / `hooks/use-voice-session.ts`

에러 메시지가 한국어로 하드코딩되어 영어/중국어 사용자에게도 한국어로 출력됨.

**해결:** i18n 키를 추가하고 메시지를 교체.

```json
// lib/i18n/locales/ko.json에 추가
"error": {
  "chatTimeout": "응답 대기 시간이 초과되었습니다.",
  "chatFailed": "채팅 요청에 실패했습니다.",
  "micDenied": "마이크에 접근할 수 없습니다.",
  "wsError": "WebSocket 연결 오류가 발생했습니다."
}
```

```ts
// contexts/chat-context.tsx — useTranslation() 또는 i18n.t() 사용
text: i18n.t("error.chatTimeout")
```

> ChatContext는 React 훅 밖이므로 `i18n` 인스턴스를 직접 import해서 사용.

---

### 5. 음성 입력 첨부파일 전송 미연결

**파일:** `app/speak/page.tsx`

파일 첨부 UI는 존재하지만 X 버튼을 누르면 그냥 홈으로 돌아가며, 첨부파일이 실제로 전송되는 경로가 없음.

**해결:** 파일 첨부 상태를 유지하고 sendMessage 호출 시 함께 전달.

```ts
// 전송 버튼 클릭 시
await sendMessage(text, { file: attachedFile ?? undefined });
router.push("/home");
```

> `sendMessage`가 파일 파라미터를 지원하지 않으면 `chat.ts`의 API 함수도 함께 수정 필요.

---

### 6. 히스토리 rename에 `window.prompt` 사용

**파일:** `app/history/page.tsx:96`

브라우저 기본 `prompt` 대화상자를 사용. 커스텀 Modal 컴포넌트가 이미 있음.

**해결:** 기존 Modal 컴포넌트로 교체.

```ts
// window.prompt 제거 후 rename 모달 상태 관리
const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);

// 메뉴 → 이름 변경 클릭 시
setRenameTarget({ id, title });

// JSX에 Modal 추가
<Modal open={!!renameTarget} onClose={() => setRenameTarget(null)}>
  {/* input + 확인 버튼 */}
</Modal>
```

---

### 7. 빈 catch 블록 (에러 피드백 없음)

**파일:** `app/graduation/upload/processing/page.tsx` / `app/history/page.tsx`

`.catch(() => {})` 로 에러를 삼켜 사용자에게 아무 피드백이 없음.

**해결:** toast 또는 에러 상태로 처리.

```ts
// 예시
.catch((e) => {
  console.error(e);
  toast.error(t("error.loadFailed")); // 또는 setError(true)
})
```

---

### 8. 로그인 아이디/비밀번호 찾기 버튼 — 기능 없음

**파일:** `app/login/page.tsx`

버튼이 있지만 아무 동작 없음.

**해결:** 기능 구현 계획이 없다면 UI에서 제거. 계획이 있다면 별도 페이지 또는 외부 링크(학교 포털)로 연결.

---

## Minor — 중기 개선 (품질 / 유지보수)

### 9. `createScriptProcessor` deprecated API

**파일:** `hooks/use-voice-session.ts:137`

`ScriptProcessorNode`는 deprecated. 메인 스레드에서 실행되어 성능 저하도 있음.

**해결:** `AudioWorklet`으로 교체. (구현 복잡도 높음 — 별도 worklet 파일 필요)

```ts
await ctx.audioWorklet.addModule("/worklets/pcm-processor.js");
const workletNode = new AudioWorkletNode(ctx, "pcm-processor");
source.connect(workletNode);
```

---

### 10. `onKeyPress` deprecated

**파일:** `components/layout/chat-input.tsx:198`

**해결:**

```ts
// Before
onKeyPress={handleKeyPress}

// After
onKeyDown={handleKeyPress}
// handleKeyPress 내부에서 e.key === "Enter" 조건은 동일하게 사용 가능
```

---

### 11. `aria-label` 한국어 하드코딩

**파일:** `components/layout/layout-content.tsx:628` / `components/layout/chat-input.tsx:207`

다국어 앱인데 aria-label이 번역 안 됨.

**해결:** `t()` 함수로 교체.

```tsx
// Before
aria-label="스캔 메뉴"

// After
aria-label={t("a11y.scanMenu")}
```

---

### 12. 언어 선택 접근성 role 누락

**파일:** `app/language-onboarding/page.tsx` / `app/my/language/page.tsx`

시각적으로 라디오 버튼처럼 작동하지만 스크린 리더가 인식 불가.

**해결:**

```tsx
<div role="radiogroup" aria-label={t("language.select")}>
  <button role="radio" aria-checked={language === "ko"} onClick={() => setLanguage("ko")}>
    한국어
  </button>
  ...
</div>
```

---

### 13. 졸업사정 배점 기준 하드코딩

**파일:** `app/graduation/result/page.tsx` / `app/graduation/upload/processing/page.tsx`

ICT 단일 학과 기준만 코드에 박혀 있음. 학과/입학연도별 다른 기준 처리 불가.

**해결:** 배점 기준을 별도 설정 파일로 분리하거나 백엔드 API로 제공.

```ts
// lib/graduation-policy.ts
export const GRADUATION_POLICY: Record<string, GraduationRequirement> = {
  "ICT융합학부": { total: 140, major: 75, coreMajor: 36, ... },
  // 학과별 추가
};
```

---

### 14. 졸업사정 로직 중복

**파일:** `app/graduation/upload/processing/page.tsx` + `app/graduation/result/page.tsx`

`mapAcademicRecordToCredits()`, `getMajorTypeFromSecondMajorType()` 등 동일 함수 중복 정의.

**해결:** `lib/graduation-utils.ts`로 추출 후 양쪽에서 import.

---

### 15. `.env.example` 없음

팀원이 필요한 환경변수를 알 방법 없음.

**해결:** 프로젝트 루트에 `.env.example` 생성.

```bash
# .env.example
NEXT_PUBLIC_API_URL=https://your-api-url/api
```

---

### 16. 버전 정보 하드코딩

**파일:** `app/my/page.tsx:17`

`MOCK_VERSION = "1.00"` 하드코딩.

**해결:** `package.json`에서 읽기.

```ts
import { version } from "@/package.json";
// 또는
const version = process.env.npm_package_version;
```
