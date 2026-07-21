# LT3-MY-TREES-002 — Known Visual Differences

## 상태

**UI BASE 단계** — 실제 데이터·API·Firebase·인증·navigation 없음

## 기준 이미지 프레임 해석

기준 이미지 `my-trees-empty-mobile.png`는 **단일 모바일 화면**을 나타냅니다.

- 상단: LoveTree 로고 + 프로필 아이콘 (sticky header)
- 중앙: 새싹 + 떠 있는 카드 일러스트레이션, 제목, 안내 문구
- 하단: 주요 CTA (첫 순간 기록하기), 보조 CTA (예시 러브트리 보기), 빠른 시작 태그 3개

## 선택한 단일 화면 기준

기준 이미지의 **주요 프레임(empty state)** 을 단일 화면으로 구현했습니다.

- 헤더: LoveTree 로고 + 마이페이지 아이콘 (기준 이미지 스타일 준수)
- 일러스트레이션: SVG 새싹 + 떠 있는 카드 3개
- 제목/안내: 기준 이미지와 동일
- CTA 버튼 2개
- 빠른 시작 태그 3개 (입덕, 첫 콘서트, 최애 무대) + leaf 아이콘

## 미포함 (UI BASE 의도적 생략)

| 항목 | 사유 |
|---|---|
| 실제 사용자 조회 | API 연동 없음 |
| 실제 트리 생성 | navigation 없음, UI-only |
| 실제 태그 선택 | onClick 없음, static presentation |
| 실제 예시 트리 이동 | navigation 없음 |
| 햄버거 메뉴 아이콘 | 기준 이미지에 없음 (profile icon만 표시) |
| 알림 아이콘 | 기준 이미지에 없음 (profile icon만 표시) |
| API·Firebase·인증 | UI BASE 단계에서 금지 |

## 접근성 구조

- `<header>`: sticky top bar (logo + profile button)
- `<main>`: 전체 컨텐츠 영역
- `<h1>`: "아직 러브트리가 없어요"
- `<section aria-labelledby="quick-start-heading">`: 빠른 시작 태그 영역
- `<h2 id="quick-start-heading">`: "어떤 순간부터 시작할까요?"
- `<ul><li><button>`: 태그 목록
- 모든 버튼: `type="button"`, `aria-label` 미필요 (텍스트가 곧 accessible name)
- `focus-visible` outline 적용

## 모바일·데스크톱 해석

**Mobile (기준):**
- 단일 컬럼, 중앙 정렬
- padding: 48px 24px 64px → 40px 20px 48px (@media ≤560px 반응형 대응)

**Desktop:**
- max-width: 480px 중앙 정렬 모바일 프레임
- 데스크톱 뷰포트에서도 모바일 UX 유지
- sticky header 유지

## radio/checkbox 상태

이 화면에는 radio/checkbox를 사용하지 않습니다.

모든 상호작용은 UI-only이며:
- 실제 저장 없음
- 실제 트리 생성 없음
- 실제 태그 선택 없음
- API·Firebase·인증 없음
- localStorage/sessionStorage 사용 없음
- navigation 없음
- onClick 없음

## VISUAL refinement 후속 항목

1. 기준 이미지 대비 폰트 크기/두께 미세 조정
2. 일러스트레이션 디테일 보강 (수채화 스타일 불가피한 차이)
3. 색상 톤 일치도 개선
4. secondary CTA hover underline 애니메이션 효과
5. 태그 아이콘 기준 이미지 leaf 스타일과 정렬
6. 모바일 상태에서 여백 최적화
