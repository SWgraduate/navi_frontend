# lib/api/ — API 클라이언트 & 캐싱

---

## client.ts — 공통 API 클라이언트

모든 API 요청은 `apiFetch<T>()` 함수를 통해 처리됩니다.

### 자동 처리 항목

- `Content-Type: application/json` 헤더 자동 추가
- localStorage `navi_access_token` → `Authorization: Bearer {token}` 헤더 자동 추가
- **401 응답** 시: `navi_access_token`, `navi_logged_in` 삭제 → `/login` 강제 리다이렉트

### 주의사항

- multipart/form-data 요청(PDF 업로드 등)은 `apiFetch`를 사용하지 말고 raw `fetch`를 사용하세요 (rag.ts 참고). `Content-Type`을 직접 지정하면 boundary가 깨집니다.

---

## student.ts — 학생 정보 In-Memory 캐시

서버 API 호출을 줄이기 위해 모듈 레벨 객체에 5분 TTL 캐시를 구현합니다.

### 캐시 구조

```typescript
const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

const studentCache: {
  academicRecord?: { data: T; timestamp: number };
  profile?: { data: T; timestamp: number };
} = {};
```

### 캐싱 대상

| 함수 | 엔드포인트 | 캐시 키 |
|---|---|---|
| `getMyProfile()` | `GET /student/me/profile` | `studentCache.profile` |
| `getMyAcademicRecord()` | `GET /student/me/academic-record` | `studentCache.academicRecord` |

### 캐시 무효화 조건

아래 함수 호출 시 **두 캐시가 모두 삭제**됩니다 (`invalidateStudentCache()`):

- `upsertMyProfile()` — 학생 프로필 생성/수정
- `updateMyAcademicRecord()` — 학적 기록 수정
- `parseAndUpdateMyAcademicRecordFromImage()` — 이미지로 학적 기록 파싱 및 업데이트

### 주의사항

> **이 캐시는 서버 메모리(Node.js 프로세스)에 저장됩니다.**

- Next.js dev 환경에서는 HMR(Hot Module Reload) 시 캐시가 초기화됩니다.
- 프로덕션에서는 서버 재시작 또는 TTL 만료 전까지 유지됩니다.
- 사용자가 프로필을 수정한 뒤 즉시 조회 시 최신 데이터가 반영되지 않을 수 있습니다 → 수정 함수 호출 후 반드시 `invalidateStudentCache()`가 호출되는지 확인하세요.
- 새로운 학생 데이터 GET 함수를 추가할 경우, 수정 함수에서 `invalidateStudentCache()` 호출 여부를 검토하세요.

### 캐시 추가/수정 시 체크리스트

- [ ] 새 캐시 항목을 `studentCache` 객체에 추가했는가?
- [ ] TTL 체크 로직을 포함했는가?
- [ ] 관련 데이터를 변경하는 함수에서 `invalidateStudentCache()`를 호출하는가?

---

## chat.ts — 비동기 채팅 폴링

채팅은 즉시 응답이 아닌 비동기 태스크 방식으로 동작합니다.

### 플로우

```
POST /chat → { taskId }
  └─ GET /chat/status/{taskId} 폴링 (1.5초 간격, 최대 60회 = 90초)
       └─ status.message || status.result || status.answer 확인
```

### 상수

```typescript
POLL_INTERVAL_MS = 1500   // 폴링 간격
MAX_POLL_ATTEMPTS = 60    // 최대 시도 횟수 (90초)
```

### 주의사항

- 컴포넌트 언마운트 시 폴링이 계속 실행될 수 있습니다. `contexts/chat-context.tsx`에서 cleanup 처리를 확인하세요.
