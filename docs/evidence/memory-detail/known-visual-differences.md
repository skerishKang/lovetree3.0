# LT3-MEMORY-002 — Known Visual Differences

## 기준 이미지

- **Path**: `docs/reference/screens/03-memory/memory-detail-mobile.png`
- **Resolution**: 2816 × 1536
- **SHA-256**: `ab0d3668d3bf8c2dfd2a533e40d8eb952ad8b451d5ea64024c467d6a23e1da3e`

## UI BASE 단계

이 구현은 UI BASE 단계로, 기준 이미지의 구조와 레이아웃을 정적 마크업으로 재현한 1차 baseline입니다.

## 모바일 2프레임 시안 해석

기준 이미지는 모바일 화면 2개를 가로로 배치한 시안입니다.

- **Frame 1 (위/왼쪽)**: 미디어 영역(재생 아이콘 포함) + 기억 제목 + 날짜 + 태그 3개 + 메모 본문 + "이 순간과 이어진 기억" 섹션 + 3개 관련 기억 카드 + 하단 액션(좋아요/댓글/공유/수정)
- **Frame 2 (아래/오른쪽)**: 동일한 구조이나 관련 기억이 없는 화면

**통합 방식**: Frame 1을 기준으로 3개의 관련 기억 카드를 포함한 단일 상세 화면으로 구현했습니다.

## 정적 미디어 placeholder

- `<video>`나 `<iframe>`을 사용하지 않고 `<div>` 정적 영역에 재생 버튼 아이콘을 배치했습니다.
- 재생 버튼은 `type="button"`이며 `onClick`이 없습니다.

## 실제 재생 없음

동영상 재생 기능은 구현하지 않았습니다. 미디어 영역은 정적 placeholder입니다.

## 좋아요·댓글·공유·수정

모두 화면에 표시되는 UI-only 버튼입니다. 실제 기능은 구현하지 않았습니다.

## 관련 기억 이동 없음

관련 기억 카드는 `ul > li > article` 구조로 마크업되었으며, `role="button"`, `tabIndex`, `draggable`, `onClick`이 없습니다. 실제 화면 이동은 구현하지 않았습니다.

## API·Firebase·인증 없음

정적 목업 데이터만 사용합니다.

## 목업 데이터

```typescript
interface RelatedMemory {
  id: string;
  title: string;
  date: string;
  description: string;
  thumbnailColorKey: string;  // "pink" | "green" | "brown"
}

interface MemoryDetailMockData {
  title: string;
  date: string;
  tags: string[];
  memo: string;
  likeCount: number;
  commentCount: number;
  relatedMemories: RelatedMemory[];
}
```

- 사용자 이름, UID, 이메일, 실제 서비스 ID 미사용
- 선택 상태는 별도의 `selectedMemoryId` 없이 정적 단일 데이터로 표현

## 관련 기억 카드 수

3개 (콘서트 준비 과정, 콘서트 굿즈 언박싱, 콘서트 후 일기)

## 모바일 레이아웃

- 한 열 배치
- 미디어 영역 전체 폭 (16:9 ratio)
- 관련 기억 카드 스택 (썸네일 + 텍스트 가로 배치)
- 하단 고정 액션 바 (좋아요/댓글/공유/수정)

## 데스크톱 해석

- 콘텐츠 최대 폭 720px로 중앙 정렬
- 관련 기억 카드는 3열 그리드로 표시
- 하단 액션 바는 480px max-width로 중앙 fixed
- 임의의 데스크톱 사이드바나 추가 레이아웃 없음

## 기준 이미지와의 차이점

1. 기준 이미지의 정밀 폰트/색상/여백 값을 근사치로 사용
2. 실제 이미지/동영상 대신 그라데이션 미디어 placeholder
3. 기준 이미지의 아이콘과 다른 SVG 아이콘 사용 (정밀 디자인 시스템 미적용)
4. 기준 이미지의 태그 디자인과 다른 rounded chip 스타일
5. 관련 기억 카드가 데스크톱에서 3열 그리드 (기준 이미지는 모바일 1열만 표시)

## 정밀 VISUAL 후속 작업

정밀 폰트 매칭, 색상 매칭, 여백/간격 보정, 아이콘 통일, 미디어 영역 정밀 디자인은 후속 VISUAL refinement 작업으로 이관합니다.

## 접근성

- 화면 제목 `h1`
- 기억 제목 `h2`
- 미디어 영역 재생 버튼에 `aria-label="기억 영상 재생"`
- 장식용 SVG는 `aria-hidden="true"`
- 태그는 `<ul>` 텍스트 목록
- "이 순간과 이어진 기억"은 `<section>` + `<h2>`로 마크업
- 관련 기억 목록 `ul > li > article`, 각 article은 `aria-labelledby`로 제목 연결
- 하단 액션 버튼에 `aria-label` (좋아요 128, 댓글 17, 공유, 수정)
- 좋아요/댓글 숫자는 `aria-label`에 포함하여 접근 가능한 이름 제공
- 좋아요: `aria-label="좋아요 128"`, 댓글: `aria-label="댓글 17"`
- `focus-visible` 스타일 적용
- 색상만으로 상태를 표현하지 않음 (텍스트 + 숫자 병기)
- `aria-live`, `aria-busy`, `aria-expanded`, `aria-pressed`, `role="dialog"` 미사용
