---
name: vercel-agent-skills
description: Integrates Vercel's official agent-skills (react-best-practices, web-design-guidelines, react-native-guidelines, composition-patterns, vercel-deploy-claimable) into Cursor. Use when writing or reviewing React/Next.js/React Native/UI code, optimizing performance and UX, or deploying this project to Vercel.
---

# Vercel Agent Skills for Cursor

This skill adapts Vercel Labs의 공식 Agent Skills 컬렉션인 `vercel-labs/agent-skills`를 Cursor에서 활용하기 쉽게 정리한 것입니다.  
원문 레포: [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills)

## 언제 이 스킬을 사용할지

아래와 같은 요청이 있을 때 이 스킬을 사용한다.

- React/Next.js 컴포넌트/페이지 작성 또는 리뷰
- React/Next.js 데이터 패칭 방식(SSR/SSG/CSR/RSC) 설계/리뷰
- 웹 UI/UX, 접근성, 폼, 이미지, 애니메이션, 타이포그래피 관련 베스트 프랙티스 점검
- React Native / Expo 코드 작성 또는 성능/구조 리뷰
- Boolean props가 많거나 API가 복잡한 React 컴포넌트 리팩터링
- "Vercel에 배포해줘", "이 프로젝트를 배포해줘"와 같은 배포 요청

요청이 위에 해당한다면, 아래 각 섹션의 지침을 체크리스트처럼 적용한다.

---

## 1. React / Next.js 성능 가이드 (`react-best-practices`)

Vercel Engineering이 정리한 React/Next.js 성능 최적화 규칙(8개 카테고리, 40+ 룰)을 요약한 섹션이다.  
새 코드를 작성하거나, 성능 이슈/리뷰 요청이 있을 때 우선적으로 적용한다.

### 1.1. 워터폴 제거 (Eliminating waterfalls) — **Critical**

- 데이터 패칭 시 **연속적인 await 체인**이 있는지 먼저 찾는다.
  - 가능하면 `Promise.all`, 병렬 패칭, 혹은 라우팅/레이아웃 구조를 변경해서 워터폴을 제거한다.
  - Next.js에서는 상위 레이아웃/페이지에서 필요한 데이터를 한 번에 패칭하고, 하위 컴포넌트에는 props로 내려주는 방향을 우선 고려한다.
- 클라이언트에서 여러 의존성이 있는 요청을 순차로 보내고 있다면:
  - 서버 액션, Route Handler, 혹은 서버 컴포넌트로 로직을 옮겨 한 번의 왕복으로 처리할 수 있는지 검토한다.

### 1.2. 번들 사이즈 최적화 (Bundle size) — **Critical**

- 클라이언트 컴포넌트에서 **불필요한 대형 라이브러리** 임포트를 확인한다.
  - 차트, 에디터, 맵, 코드 하이라이터 등은 `dynamic(() => import(...), { ssr: false })` + on-demand 로드 패턴을 우선 고려한다.
- 공통 유틸/컴포넌트가 클라이언트/서버 양쪽에서 쓰이는 경우:
  - 서버 전용 로직(파일 I/O, heavy 연산)은 별도 모듈로 분리해 클라이언트 번들에 포함되지 않게 한다.
- 이미지/아이콘:
  - Next.js `next/image`, 아이콘은 개별 임포트 또는 아이콘 트리 셰이킹 가능한 패키지를 사용하도록 유도한다.

### 1.3. 서버 사이드 성능 (Server-side performance) — **High**

- 서버 컴포넌트/Route Handler/서버 액션에서:
  - DB/외부 API 호출을 병렬화할 수 있는지 확인한다.
  - N+1 쿼리 패턴이 없는지 검사하고, 가능하면 조인/배치 쿼리/캐시로 대체한다.
- 캐시 전략:
  - 정적 가능 데이터는 Next.js의 빌트인 캐싱(Static Generation/`revalidate`)을 활용하도록 제안한다.
  - 자주 호출되는 비즈니스 로직에는 **캐시 키 + 만료 정책**을 의식적으로 설계한다.

### 1.4. 클라이언트 데이터 패칭 (Client-side data fetching) — **Medium-High**

- SWR/React Query 등 클라이언트 패칭을 쓸 때:
  - 불필요한 refetch, 폴링, 중복 요청이 없는지 확인한다.
  - "즉시 필요하지 않은 데이터"는 사용자 액션 이후 혹은 view 진입 이후 로드하도록 나눈다.
- 전역 상태 + 데이터 패칭이 섞여 있을 경우:
  - 서버로 옮길 수 있는 부분은 서버로 옮기고, 클라이언트 전역 상태는 UI 상태 중심으로 최소화한다.

### 1.5. 리렌더 최적화 (Re-render optimization) — **Medium**

- React 컴포넌트 리뷰 시:
  - 부모에서 불필요하게 큰 객체/함수를 매 렌더마다 새로 만들어 넘기는지 확인한다.
  - 필요 시 `useMemo`/`useCallback`/`memo`를 사용하되, 과도한 사용보다는 의존성/구조 재설계를 우선 검토한다.
- 리스트 렌더링:
  - key로 index 사용 여부를 확인하고, 가능한 안정적인 고유 key를 사용하도록 제안한다.

### 1.6. 렌더링 성능 (Rendering performance) — **Medium**

- 긴 리스트/테이블:
  - 뷰포트에 보이는 부분만 렌더링하는 **가상 스크롤링(virtualization)** 도입을 우선적으로 고려한다.
- 비싼 연산(정렬, 필터링, 포맷팅 등)을 매 렌더마다 수행하는지 확인하고:
  - 메모이제이션, 서버 이동, 또는 비동기 처리로 옮길 수 있는지 검토한다.

### 1.7. JavaScript 마이크로-최적화 — **Low-Medium**

- 전체적인 아키텍처/데이터 흐름 최적화가 끝난 뒤에만 마이크로 최적화를 고려한다.
- 루프 안에서 불필요한 작업, 중복 연산 등을 줄이되, 가독성을 심하게 해치는 변경은 피한다.

---

## 2. 웹 UI / 접근성 / UX 가이드 (`web-design-guidelines`)

웹 인터페이스의 접근성, UX, 퍼포먼스를 점검하는 체크리스트이다.  
UI 리뷰, 디자인/마크업 구현 리뷰, "접근성 봐줘", "UX 검토해줘" 같은 요청에 사용한다.

### 2.1. 접근성 (Accessibility)

- 시맨틱 HTML 사용 여부:
  - 버튼/인터랙션에 `<button>`/`<a>`를 사용하고, `div`+`onClick`만 쓰는 패턴을 피한다.
- ARIA:
  - 필요한 경우에만 `aria-*`를 사용하고, 네이티브 역할을 중복 정의하지 않도록 한다.
- 레이블:
  - 폼 컨트롤에는 시각적/프로그램적 레이블이 있는지(`label` 태그, `aria-label`, `aria-labelledby`) 확인한다.

### 2.2. 포커스 상태 (Focus States)

- 키보드만으로 모든 인터랙션이 가능한지 상정하고 검토한다.
- 포커스가 보이지 않게 숨겨져 있지 않은지, `:focus-visible`를 적절히 사용하는지 확인한다.

### 2.3. 폼 (Forms)

- `autocomplete` 속성:
  - 이메일, 이름, 주소, 카드 정보 등에는 적절한 `autocomplete` 값을 부여하도록 검토한다.
- 에러 처리:
  - 유효성 실패 시 사용자에게 명확한 피드백(텍스트/ARIA)을 제공하는지 확인한다.

### 2.4. 애니메이션 (Animation)

- CSS/JS 애니메이션은 가능한 한 **transform/opacity** 중심으로 구현하도록 제안한다.
- `prefers-reduced-motion` 미디어 쿼리를 고려해, 모션을 줄여야 하는 사용자 환경에서 애니메이션을 줄이거나 비활성화하도록 검토한다.

### 2.5. 타이포그래피 & 숫자 (Typography)

- 긴 텍스트에 `line-height`, 적절한 폰트 크기, 대비를 확인한다.
- 숫자 정렬/표 형식에는 `tabular-nums` 같은 속성 사용을 고려한다.

### 2.6. 이미지 & 퍼포먼스 (Images & Performance)

- 이미지에는 적절한 `width`/`height` 또는 레이아웃 제약이 있는지 확인해 레이아웃 시프트를 줄인다.
- Lazy loading:
  - fold 아래 이미지는 `loading="lazy"` 또는 Next.js `next/image`의 lazy loading을 활용한다.
- alt 텍스트:
  - 의미 있는 이미지는 적절한 `alt`, 장식용 이미지는 빈 `alt=""`를 사용하는지 확인한다.

### 2.7. 내비게이션 & 상태 (Navigation & State)

- URL이 현재 상태를 반영하는지(필터, 페이지, 탭 등) 검토한다.
- 딥링크 가능 여부:
  - 특정 상태/뷰로 직접 진입할 수 있는지 확인한다.

---

## 3. React Native 가이드 (`react-native-guidelines`)

React Native / Expo 앱에 대한 베스트 프랙티스(성능, 레이아웃, 애니메이션, 이미지, 상태 관리, 아키텍처, 플랫폼별 패턴)를 요약한 섹션이다.

### 3.1. 성능 (Performance) — Critical

- 긴 리스트에는 `FlatList`/`SectionList` 사용을 기본으로 하고, 데이터가 크다면 FlashList와 같은 고성능 리스트 컴포넌트를 고려한다.
- 무거운 연산은 JS 스레드에서 동기적으로 실행하지 않고, 가능한 경우 네이티브 모듈/백그라운드 작업으로 오프로드할 수 있는지 검토한다.

### 3.2. 레이아웃 (Layout)

- `flex` 레이아웃에서 하드코딩된 픽셀 값보다 유연한 레이아웃을 우선 검토한다.
- Safe area:
  - notch/홈 인디케이터 대응을 위해 `SafeAreaView` 혹은 작업 중인 네비게이션 라이브러리의 safe area 컴포넌트를 사용하는지 확인한다.
- 키보드:
  - 폼 UI에서 키보드가 입력 필드를 가리지 않도록 `KeyboardAvoidingView` 또는 적절한 스크롤 처리가 있는지 검토한다.

### 3.3. 애니메이션 & 제스처 (Animation)

- 복잡한 애니메이션/제스처는 Reanimated/gesture-handler를 사용하는 패턴을 우선 검토한다.
- 스크롤/터치와 애니메이션이 동시에 발생할 때 프레임 드랍이 없는 구조인지 유심히 본다.

### 3.4. 이미지 (Images)

- 네트워크 이미지는 캐싱 가능한 이미지 컴포넌트(예: `expo-image`) 사용을 고려한다.
- 해상도/크기에 맞는 소스를 제공하고, 필요하다면 `resizeMode`를 적절히 세팅한다.

### 3.5. 상태 관리 & 아키텍처

- 전역 상태는 최소화하고, 화면/모듈 단위로 상태를 캡슐화할 수 있는지 검토한다.
- API/서비스 레이어를 분리해, 뷰 컴포넌트에서 네트워크 로직이 새는 것을 방지한다.

---

## 4. React 컴포지션 패턴 (`composition-patterns`)

Boolean props가 많고, "옵션 폭격" 스타일의 컴포넌트 API를 개선할 때 사용하는 섹션이다.

### 4.1. Boolean prop 폭발 방지

- 컴포넌트에 `isX`, `hasY`, `variant="..."` 등 불리언/옵션 props가 너무 많은지 확인한다.
- 이런 경우:
  - 내부 구현을 쪼개서 **컴파운드 컴포넌트 패턴**으로 재구성할 수 있는지 검토한다.
  - 예: `Modal` → `Modal.Root`, `Modal.Trigger`, `Modal.Content`, `Modal.Title`, `Modal.Actions` 등.

### 4.2. 상태 리프팅 & 내부 컴포지션

- 상위에서 모든 상태를 관리하며 props로 깊게 내려보내고 있지는 않은지 본다.
  - 상태를 상위로 올릴지, 로컬 상태로 둘지, 컨텍스트를 사용할지 결정할 때 컴포지션을 우선 고려한다.
- 내부적으로 여러 전략을 가지는 컴포넌트라면:
  - 조건 분기 대신 내부에서 전략/슬롯을 조합하는 패턴을 사용할 수 있는지 검토한다.

### 4.3. API 설계

- 사용자가 자연스럽게 읽고 쓸 수 있는 JSX 형태가 무엇인지 먼저 생각하고, 구현을 그에 맞춰 조정한다.
- 컴포넌트의 public API 변경이 UX에 어떤 영향을 주는지(기존 코드, 직관성) 함께 설명한다.

---

## 5. Vercel 배포 (`vercel-deploy-claimable`)

이 섹션은 Vercel Labs의 `vercel-deploy-claimable` 스킬 개념을 바탕으로, 이 프로젝트를 Vercel에 배포할 때의 워크플로를 정리한다.  
환경에 따라 실제 자동 배포 스킬이 없을 수 있으므로, 아래 순서를 기본 가이드라인으로 사용한다.

### 5.1. 배포 전략 개요

- 사용 중인 프레임워크를 파악한다(Next.js, Vite, Astro, 정적 HTML 등).  
  - 이 정보는 `package.json`의 `dependencies`/`scripts`에서 확인한다.
- 이 프로젝트가 Vercel에 적합한 구조인지(프레임워크 지원 여부, 빌드 스크립트 존재 등)를 짧게 점검한다.

### 5.2. 로컬에서 배포 준비

- `package.json`에 다음 항목이 있는지 확인하거나 제안한다.
  - `build` 스크립트
  - Next.js/React 앱의 경우, 기본적인 `start` 혹은 Vercel에서 빌드 후 필요한 스크립트
- `.gitignore`, `node_modules`, `.next` 등은 배포 번들에서 제외되도록 기본 설정을 가정한다.

### 5.3. Vercel CLI 배포 가이드

실제 `vercel-deploy-claimable` 스킬이 제공될 수 없는 환경에서는, 아래와 같이 Vercel CLI를 사용하도록 안내한다.

1. Vercel CLI 설치(없다면):
   - `npm i -g vercel` 또는 `npx vercel` 사용
2. 프로젝트 루트에서:
   - 첫 배포: `npx vercel`  
   - 후속 배포: `npx vercel --prod`
3. 빌드 에러가 발생하면:
   - 에러 메시지를 기반으로 `build` 스크립트, 환경 변수, 프레임워크 설정을 수정하도록 돕는다.

### 5.4. Claimable 배포 개념

- `vercel-deploy-claimable` 개념은:
  - 에이전트가 대신 배포한 뒤, 사용자가 `Claim URL`을 통해 자신의 Vercel 계정으로 소유권을 이전하는 방식이다.
- 만약 이 기능이 사용 가능한 환경이라면:
  - 배포 결과로 **Preview URL**과 **Claim URL** 두 가지를 반환하도록 기대하고, 둘 다 사용자에게 명확히 제공한다.

---

## 6. 사용 시 워크플로 요약

요청을 처리할 때 다음 워크플로를 기본으로 삼는다.

1. **요청 분류**
   - React/Next.js 성능/구조/데이터 패칭 관련 → 섹션 1
   - 웹 UI/UX/접근성/폼/이미지/애니메이션 → 섹션 2
   - React Native/Expo 앱 → 섹션 3
   - Boolean props 폭발/컴포넌트 API 설계/컴포지션 → 섹션 4
   - Vercel 배포/배포 파이프라인 → 섹션 5
2. **체크리스트 적용**
   - 해당 섹션의 핵심 항목을 체크리스트처럼 훑으며 코드/설계를 리뷰하거나 제안한다.
3. **구체적 제안과 예시 제공**
   - 단순 원칙 나열이 아니라, 지금 코드/상황에 바로 적용 가능한 리팩터링/코드 예시/CLI 명령을 함께 제시한다.
4. **트레이드오프 설명**
   - 성능/복잡도/가독성/유지보수성 사이의 트레이드오프를 간단히 언급해, 왜 이 선택이 좋은지 설명한다.

