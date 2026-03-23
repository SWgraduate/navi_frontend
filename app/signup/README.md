# app/signup/ — 회원가입 플로우 & sessionStorage 캐싱

회원가입은 6단계 멀티스텝 플로우입니다. 각 단계 간 데이터는 **sessionStorage**에 임시 저장됩니다.

---

## 플로우 다이어그램

```
/signup (약관 동의)
  └─ /signup/email (이메일 입력 + 인증 메일 발송)
       └─ /signup/verify (인증번호 확인)
            └─ /signup/name (이름 입력)
                 └─ /signup/password (비밀번호 입력)
                      └─ /signup/complete (학적 정보 입력 + 최종 API 호출)
                           └─ /signup/welcome (완료)
```

---

## sessionStorage 키

| 키 | 저장 위치 | 사용 위치 | 초기화 조건 |
|---|---|---|---|
| `signup_email` | `email/page.tsx` | `verify/page.tsx`, `complete/page.tsx` | 탭 닫힘 / 브라우저 종료 |
| `signup_name` | `name/page.tsx` | `complete/page.tsx` | 탭 닫힘 / 브라우저 종료 |
| `signup_password` | `password/page.tsx` | `complete/page.tsx` | 탭 닫힘 / 브라우저 종료 |
| `signup-agreed` | `page.tsx` (약관) | `page.tsx` (약관) | 페이지 **로드 시 즉시 삭제** |

> **sessionStorage는 탭이 닫히면 자동으로 삭제됩니다.** 따라서 회원가입 중 탭을 닫으면 처음부터 다시 시작해야 합니다.

---

## 각 단계별 동작

### 1단계: 약관 동의 (`/signup`)

- 약관 상세 페이지로 이동하기 직전에 현재 체크 상태를 `signup-agreed`에 저장.
- 약관 페이지에서 돌아오면 `signup-agreed`를 읽어 체크 상태 복원 후 **즉시 삭제**.
- `signup-agreed`는 약관 → 상세 → 약관 내비게이션에서만 사용되는 **1회성 임시 데이터**입니다.

### 2단계: 이메일 입력 (`/signup/email`)

- `sendAuthEmail()` API 성공 후 `sessionStorage.setItem("signup_email", email)`.
- 이메일 값은 이후 `verify`, `complete` 단계에서 읽어서 사용.

### 3단계: 인증번호 확인 (`/signup/verify`)

- `sessionStorage.getItem("signup_email")`로 이메일 조회 후 `verifyAuthEmail()` API 호출.
- **재발송 제한** (localStorage 사용):
  - `signup_verify_resend`: `{ date: "YYYY-MM-DD", count: number }` — 오늘 날짜와 비교해 재발송 횟수 추적.
  - `signup_verify_locked_until`: 타임스탬프(ms) — 5회 초과 시 24시간 락.
  - 하루 최대 5회. 5회 초과 시 24시간 동안 재발송 불가.

### 4단계: 이름 입력 (`/signup/name`)

- `sessionStorage.setItem("signup_name", name)`.

### 5단계: 비밀번호 입력 (`/signup/password`)

- `sessionStorage.setItem("signup_password", password)`.

### 6단계: 학적 정보 입력 + 회원가입 완료 (`/signup/complete`)

- sessionStorage에서 `signup_email`, `signup_name`, `signup_password`를 모두 읽어 `register()` API 호출.
- 성공 시 localStorage에 `navi_access_token`, `navi_logged_in` 저장 (auth-storage.ts 참고).

---

## 주의사항

- 단계를 건너뛰고 직접 URL로 접근하면 sessionStorage 값이 없어 오류가 발생할 수 있습니다. 각 단계에서 이전 단계 데이터 존재 여부를 검증하는 로직이 있는지 확인하세요.
- `signup_password`는 sessionStorage에 평문으로 저장됩니다. 회원가입 완료 후 명시적으로 삭제하는 로직이 있는지 확인하세요.
- 재발송 제한 키(`signup_verify_resend`, `signup_verify_locked_until`)는 localStorage에 저장되므로 탭을 닫아도 유지됩니다.
