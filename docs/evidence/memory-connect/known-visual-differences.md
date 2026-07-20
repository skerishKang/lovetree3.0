# 알려진 시각 차이 — LT3-MEMORY-001 (Memory Connect)

> 기준 이미지: `docs/reference/screens/03-memory/memory-connect-mobile.png` (1536×2752)
> 기준 이미지 SHA-256: `dac6ad78a14cfc91bab5de19debc13e8eba7a8506e3e7ed73003ea84ce74a2da`
> 구현 브랜치: `feat/memory-connect-baseline`

## 현재 구현 상태

| 항목 | 상태 |
|---|---|
| 구현 단계 | **BASE** — 디자인 구조·시각 계층·반응형·정적 목업 |
| 상호작용 | **presentation-only** — React state 변경, API, Firebase, localStorage 모두 없음 |
| 선택 상태 | **고정** — 목업 데이터에서 `selectedNodeId: 'mem-node-4'`로 고정, 사용자 클릭으로 변경 불가 |
| CTA | `button type="button"`, `onClick` 없음, 문구 변화 없음 |

## 기준 이미지와 BASE 구현 차이

### 1. 배경 장식
| 항목 | 기준 이미지 | BASE 구현 |
|---|---|---|
| 배경 스타일 | 파스텔 그라데이션 + 미세 장식 요소 | CSS linear-gradient만 사용 |
| 패널 그림자 | 복합 그림자 효과 | 단순 box-shadow |
| 하단 장식 | 추가 시각 요소 있을 수 있음 | 구현하지 않음 |

### 2. 연결선
| 항목 | 기준 이미지 | BASE 구현 |
|---|---|---|
| 선 스타일 | 곡선/유선형 연결선 | CSS dashed 직선 |
| 노드 연결 방식 | 중앙 정렬, 정밀 위치 | flex column + 세로 구분선 |

### 3. 카드/노드 디테일
| 항목 | 기준 이미지 | BASE 구현 |
|---|---|---|
| 아이콘 | 정밀 SVG/일러스트 | 이모지 문자 |
| 카드 그림자 | 복합 그림자 | 기본 box-shadow |
| 카드 테두리 | 정밀 border-radius | CSS border-radius 20px |
| 선택 표시 | 정밀 하이라이트 효과 | 2.5px 외곽 box-shadow + 강화된 그림자 |
| 태그 스타일 | 둥근 칩 디자인 | inline-block 태그 |

### 4. 모바일 → 데스크톱 확장 방식

데스크톱에서는 주요 콘텐츠 영역에 `max-width: 600px`을 적용하고, 기억 노드 카드는 최대 `400px`로 제한해 중앙 배치한다. 기준 이미지에는 데스크톱 레이아웃이 없으므로, 이는 BASE 구현의 해석이다.

### 5. 텍스트/문구

| 항목 | 기준 이미지 | BASE 구현 |
|---|---|---|
| 설명 문구 | 기준 이미지 원문 불명확 | 자연스러운 목업 문구 사용 |

## 고정 selected 상태 구현 방식

- 목업 데이터(`memoryConnectMockData.ts`)에서 `selectedNodeId: 'mem-node-4'`로 네 번째 노드("컴백 D-Day")를 고정 선택
- 각 노드의 선택 상태는 `node.id === data.selectedNodeId`로 계산 (단일 진실원천)
- 선택된 노드는 `data-selected="true"` 속성 + 2.5px 외곽 box-shadow + 강화된 그림자로 시각적 구분
- `aria-current="location"`으로 접근성 정보 제공
- 사용자 클릭으로 선택 상태 변경 불가 (onClick 없음)

## VISUAL 이관 항목 (향후 정밀 디자인 작업)

1. 배경 장식 요소 (파스텔 패턴/그라데이션 정밀화)
2. 연결선 곡률 및 글로우 효과
3. SVG 아이콘 정밀 제작
4. 카드 그림자·질감·테두리 pixel-level 보정
5. 선택 상태 하이라이트 정밀화
6. 정확한 폰트 (Pretendard 등)
7. 카드 간 간격 최적화
8. 하단 CTA 버튼 그림자/라운드 정밀 보정

## 금지/제외 항목

- API·Firebase·localStorage 없음
- 실제 메모리 연결 기능 없음
- 기존 화면(Tree Detail, Community 등)과의 링크 연결 없음
- CTA 클릭 후 성공 처리·toast·modal·페이지 이동 없음
- 노드 클릭에 따른 React 상태 변경 없음
