# app/graduation/ — 졸업사정조회 플로우 & 캐싱

---

## 플로우 다이어그램

```
/graduation (업로드 화면)
  ├─ [저장된 결과 있음] → /graduation/result (즉시 표시)
  └─ [PDF 업로드] → /graduation/upload/processing (분석 중)
                         └─ /graduation/result (결과 표시)
```

---

## 사용 중인 캐싱

### 1. localStorage — 졸업사정 결과 (`navi_graduation_result`)

관련 함수: `lib/mock-accounts.ts`의 `getGraduationResult`, `setGraduationResult`, `clearGraduationResult`, `hasGraduationResult`

| 동작 | 설명 |
|---|---|
| PDF 분석 완료 | `setGraduationResult(data)` 로 결과 저장 |
| `/graduation` 접속 | `hasGraduationResult()` 확인 → 있으면 `/graduation/result`로 바로 이동 |
| `/graduation/result` 접속 | localStorage 결과 + API 데이터 조합으로 화면 구성 |
| 결과 초기화 | `clearGraduationResult()` 호출 |

**저장 구조:**
```typescript
type GraduationResultData = {
  type: "BASIC" | "DOUBLE" | "MICRO";
  credits: Record<CreditKey, string>;
}
```

---

### 2. sessionStorage — 플로우 제어 플래그 (`navi_skip_saved_graduation_result_once`)

이 플래그는 `/graduation/result`에서 오류가 발생하거나 학적 데이터가 없을 때 `/graduation`으로 돌아가면서 **"저장된 결과로 자동 진입하는 루프"를 방지**하기 위한 1회용 플래그입니다.

#### 사용 시나리오

```
[정상 케이스]
/graduation → hasGraduationResult() = true → /graduation/result → 결과 표시 ✅

[오류 케이스 - 플래그 없으면 무한 루프]
/graduation → /graduation/result → API 에러 발생
  → sessionStorage.setItem("navi_skip_saved_graduation_result_once", "1")
  → /graduation으로 이동
  → /graduation이 플래그 확인 후 자동 진입 스킵 (플래그 삭제)
  → 사용자가 직접 PDF 업로드 ✅
```

#### 동작 순서

1. **`/graduation/result`** (`result/page.tsx`): API에서 학적 데이터를 가져오지 못하면
   ```js
   sessionStorage.setItem("navi_skip_saved_graduation_result_once", "1");
   router.push("/graduation");
   ```

2. **`/graduation`** (`page.tsx`): 진입 시 플래그 확인
   ```js
   const skip = sessionStorage.getItem("navi_skip_saved_graduation_result_once");
   if (skip) {
     sessionStorage.removeItem("navi_skip_saved_graduation_result_once"); // 즉시 삭제
     return; // 자동 진입 안 함
   }
   if (hasGraduationResult()) {
     router.push("/graduation/result");
   }
   ```

---

## 주의사항

- **`navi_graduation_result`는 서버 데이터와 동기화되지 않습니다.** PDF를 새로 업로드하면 반드시 `setGraduationResult()`로 덮어써야 합니다.
- **학적 API 데이터와 localStorage 결과가 불일치할 수 있습니다.** 서버 측 데이터가 변경된 경우 localStorage 캐시가 구버전 데이터를 보여줄 수 있습니다.
- `navi_skip_saved_graduation_result_once`는 사용 즉시 삭제됩니다 (1회용). 이 값을 읽은 직후 반드시 `removeItem()`을 호출하세요.
- 학적 데이터 조회는 `lib/api/student.ts`의 5분 TTL 인메모리 캐시를 거칩니다. 졸업사정 결과 화면에서 최신 데이터가 필요하다면 캐시 무효화 타이밍을 고려하세요.
