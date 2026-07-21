# LT3-EDITOR-001 — 빈 트리 에디터 UI BASE — Known Visual Differences

## UI BASE 단계

이 구현은 LT3-EDITOR-001의 UI BASE 단계입니다. 실제 트리 생성, 순간 추가, sidebar navigation, Firebase/API 연동 없이 정적 마크업과 CSS만 포함합니다.

## 기준 이미지 해석

- **기준 이미지**: `docs/reference/screens/05-editor/empty-tree-desktop.png`
- **해상도**: 2752 × 1536
- **선택한 기준**: 데스크톱 빈 에디터 화면 전체
- 기준 이미지는 macOS 데스크톱 앱 스타일의 창 신호등 버튼(빨강/노랑/초록)이 포함된 UI를 보여주지만, 웹 앱 구현이므로 해당 OS 장식은 제외했습니다.

## 불확실한 메뉴명을 제외한 이유

기준 이미지에서 좌측 사이드바 메뉴 중 "패의 보기" 항목과 하단 "러브트리" 항목은 판독이 불확실하여 구현에서 제외했습니다. 포함한 메뉴는 기준 이미지에서 명확히 확인 가능한 **내 러브트리**, **탐색**, **설정** 3개입니다.

## 실제 트리·순간 생성 없음

- 모든 버튼은 UI-only입니다 (`type="button"`, handler 없음)
- CTA "첫 순간 추가" 클릭해도 아무 일도 일어나지 않음
- 실제 트리, 순간, 기억이 생성되지 않음

## 실제 sidebar navigation 없음

- 사이드바 버튼은 실제 페이지 이동 없음
- `useNavigate`, `navigate()`, `<a href>`, `window.location` 모두 미사용

## API·Firebase·인증 없음

- `fetch`, `axios`, `firebase`, `localStorage`, `sessionStorage` 모두 미사용
- 네트워크 요청 0회

## 빈 캔버스 표현 방식

중앙 빈 에디터는 제목, 안내 문구, CTA 버튼, 그리고 장식용 나뭇가지 SVG 일러스트레이션으로 구성했습니다. 실제 캔버스, 기억 카드, 상세 패널, 연결선은 표시하지 않습니다.

## 의미 구조와 접근성

- 좌측: `<aside>` 사이드바 + `<nav aria-label="에디터 메뉴">` + `<ul>/<li>/<button>` 구조
- 중앙: `<main>` + `<section aria-labelledby="new-tree-heading">`
- 제목: `<h1 id="new-tree-heading">`
- 모든 버튼: `type="button"`, `cursor: default`, `focus-visible` 스타일 적용
- 프로필 영역: `<div aria-label="사용자 프로필">`

## 데스크톱·모바일 반응형 해석

- **Desktop (1440px)**: 고정 폭 240px 좌측 사이드바 + 나머지 영역을 차지하는 중앙 빈 에디터. 제목과 CTA가 캔버스 중앙에 정렬.
- **Mobile (390px)**: 사이드바를 상단 가로 메뉴 영역으로 전환 (flex-direction: column → row). 브랜드명 + 가로 메뉴 + 아바타만 표시. 프로필명은 숨김.

## VISUAL refinement 후속 항목

- 기준 이미지의 정확한 브랜드 컬러 및 타이포그래피 매칭
- 빈 캔버스 배경 장식 SVG 정밀 조정
- 사이드바 메뉴 active 상태 표시
- 기준 이미지의 하단 메뉴 항목 확인 후 추가
- 애니메이션 및 전환 효과
- 실제 editor 페이지와의 일관성 검토
