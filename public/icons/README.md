# 디자인 시스템 아이콘 (Navi Design System · 07 Icon)

Figma 디자인 시스템의 아이콘을 이 폴더에 두고 사용합니다.

## Figma에서 내보내기

Figma MCP는 **섹션/프레임 단위**로는 하위 아이콘 목록을 주지 않아, 한 번에 자동 다운로드는 불가능합니다. 아래 방법으로 수동 내보내기 후 이 폴더에 넣어주세요.

1. **Figma 파일**  
   [졸작 캡스톤 · 07 Icon](https://www.figma.com/design/5ZKJkYmk6v3nuiJB3Q218D/?node-id=1233-20299) 해당 노드로 이동

2. **전체 아이콘 프레임 내보내기**  
   - 왼쪽 레이어에서 아이콘이 들어 있는 **프레임** 선택  
   - 오른쪽 패널 하단 **Export** → **+** → 형식 **SVG** 선택 후 **Export [프레임 이름]** 클릭  
   - 받은 SVG를 `public/icons/` 아래에 넣기 (이름 예: `icon-arrow-left.svg`)

3. **아이콘 하나씩 내보내기**  
   - 내보낼 **아이콘 컴포넌트/그룹**만 선택  
   - **Export** → **SVG** → **Export**  
   - 용도에 맞는 파일명으로 저장 후 `public/icons/`에 저장

4. **코드에서 사용**  
   - Next.js에서는 `public` 아래 파일은 `/icons/파일명.svg` 로 참조  
   - 예: `<img src="/icons/icon-arrow-left.svg" alt="뒤로" />`  
   - 또는 SVG를 React 컴포넌트로 만들어서 사용 (예: `@svgr/webpack` 등)

## 대안: Lucide 아이콘

디자인과 비슷한 라인 아이콘이 필요하면 프로젝트에 포함된 **`lucide-react`** 를 사용할 수 있습니다.

```tsx
import { ArrowLeft, Search, Clock, ChevronUp } from "lucide-react";

<ArrowLeft className="size-5" />
```

Figma에서 내보낸 SVG를 쓰면 디자인 시스템과 완전히 동일하게 맞출 수 있고, Lucide는 빠르게 프로토타입할 때 유용합니다.
