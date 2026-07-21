# LT3-AUTH-001 — Known Visual Differences

**Reference:** `docs/reference/screens/08-auth/login-my-page-mobile.png` (768×1376)

## Visual Differences

| 차이 | 설명 | 처리 |
|---|---|---|
| 브랜드명 | Reference는 "Relovetree", 구현은 "LoveTree" | REQUIREMENT |
| 헤딩 텍스트 | Reference는 "내 러브트리를 계속 이어가려면 로그인하세요", 구현은 "LoveTree에 계속 이어가려면 로그인하세요" | REQUIREMENT |
| 배경 | Reference는 단색, 구현은 부드러운 그라데이션 (#fdf8f0 → #faf0e4) | IMPLEMENTATION |
| 버튼 스타일 | Google 버튼은 primary (갈색 배경)으로 시각적 우선순위 구분 | REQUIREMENT |
| 추가 섹션 | 신뢰 문맥(Trust Context)과 핵심 가치(Value Items) 추가 | REQUIREMENT |
| 프로필 미리보기 | 유지하되 레이아웃 조정 | MAINTAINED |
| 아이콘 | Unicode 문자 사용 (G, ✉, 📚, 🔄, 🔗) | REQUIREMENT |

## Mobile Layout Changes

- 모바일에서는 모든 섹션이 스크롤 가능한 컨텍스트 내에 배치
- 버튼은 가로폭 100%로 확장
- 프로필 미리보기와 핵심 가치 섹션은 세로로 연결

## Desktop Layout Changes

- 900px 이상에서는 브랜드와 로그인 패널이 좌우 2열 레이아웃
- 브랜드 섹션은 왼쪽, 로그인 요소는 오른쪽
- 각 섹션은 독립적인 컨테이너로 구분

## Color Palette

- 배경: #fdf8f0 → #faf0e4 (그라데이션)
- 브랜드 텍스트: #3e2c1a (갈색)
- 헤딩: #4a3728 (짙은 갈색)
- 설명 텍스트: #8a7a6a (회색)
- Google 버튼: #3e2c1a 배경, #fff 텍스트
- 이메일 버튼: #fff 배경, #3e2c1a 테두리/텍스트

## Typography

- 브랜드명: clamp(1.5rem, 5vw, 2rem)
- 헤딩: clamp(1.05rem, 3.5vw, 1.35rem)
- 설명: clamp(0.82rem, 2.5vw, 0.95rem)
- 버튼: 0.9rem
- 가치 아이템: 0.85rem 라벨, 0.75rem 설명

## Implementation Notes

- 모든 장식 요소는 `aria-hidden="true"` 적용
- 실제 인증/API/Firebase 호출 없음
- presentation-only 계약 유지