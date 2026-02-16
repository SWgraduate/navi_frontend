# 모바일 키보드 처리 가이드

## 현재 구현 방식

### 1. 키보드 감지 (`hooks/use-keyboard-status.ts`)
- **목적**: 키보드가 열렸는지, 높이는 얼마인지 감지
- **방법**: 
  - VirtualKeyboard API (있으면 사용)
  - VisualViewport API (fallback)
- **결과**: `isKeyboardOpen`, `keyboardHeight` 반환

### 2. 레이아웃 조정 (`components/layout/layout-content.tsx`)
- **목적**: 키보드가 올라오면 메인 영역 높이를 줄임
- **방법**: 
  - `visualViewport.height`에서 헤더, ChatInput, 하단바 높이를 뺀 값으로 메인 영역 높이 설정
  - 스크롤 위치를 저장했다가 복원하여 화면이 고정되도록 함

### 3. ChatInput 위치 조정 (`components/layout/chat-input.tsx`)
- **목적**: 키보드 위에 ChatInput이 보이도록 위치 조정
- **방법**: 
  - 키보드가 열려있으면 `bottom: keyboardHeight`
  - 없으면 `bottom: 하단바 높이`

## 동작 흐름

```
1. 사용자가 input 클릭
   ↓
2. OS가 키보드 표시
   ↓
3. visualViewport.height가 줄어듦
   ↓
4. useKeyboardStatus가 감지 → isKeyboardOpen = true
   ↓
5. LayoutContent가 메인 영역 높이 조정
   ↓
6. ChatInput이 키보드 위로 이동
   ↓
7. 스크롤 위치 복원 (화면 고정)
```

## 문제 해결 체크리스트

### 키보드가 감지되지 않을 때
- [ ] 브라우저 콘솔에서 "Keyboard Status" 로그 확인
- [ ] `interactiveWidget: "resizes-visual"` 설정 확인
- [ ] 실제 모바일 기기에서 테스트 (데스크톱은 키보드가 없음)

### 스크롤이 이상하게 동작할 때
- [ ] `scrollPositionRef.current` 값 확인
- [ ] `isAdjustingScrollRef.current` 플래그 확인
- [ ] 메인 영역 높이가 올바르게 계산되는지 확인

### ChatInput이 키보드를 가릴 때
- [ ] `keyboardHeight` 값이 올바른지 확인
- [ ] `bottomValue` 계산 로직 확인
- [ ] 하단바 높이 계산이 올바른지 확인

## 테스트 방법

1. **모바일 기기에서 테스트**
   ```bash
   npm run dev
   # 네트워크 IP로 접속 (예: http://192.168.x.x:3000)
   ```

2. **개발자 도구로 확인**
   - 콘솔에서 "Keyboard Status" 로그 확인
   - Elements 탭에서 메인 영역 높이 확인
   - Network 탭에서 visualViewport 이벤트 확인

3. **시뮬레이션**
   - Chrome DevTools → Device Toolbar
   - 하지만 실제 키보드는 시뮬레이션 불가능

## 간단한 대안 (필요시)

만약 현재 구현이 너무 복잡하다면:

1. **CSS만으로 처리** (제한적)
   - `height: 100svh` 사용
   - 키보드가 올라오면 자동으로 조정됨
   - 하지만 스크롤 위치 제어는 어려움

2. **간단한 JavaScript**
   - input focus 시에만 처리
   - 키보드 높이 감지 없이 고정값 사용

3. **현재 방식 유지** (권장)
   - 가장 정확하고 사용자 경험이 좋음
   - 하지만 복잡함
