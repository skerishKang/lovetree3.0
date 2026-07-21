/**
 * LT3-MY-TREES-002 — 마이 트리 빈 상태 정적 목업 데이터
 * 실제 API/Firebase 호출 없음
 * 실제 사용자 정보·UID·이메일·트리 ID 없음
 */

export interface QuickStartTag {
  id: string;
  label: string;
}

export const QUICK_START_TAGS: QuickStartTag[] = [
  { id: "first-love", label: "입덕" },
  { id: "first-concert", label: "첫 콘서트" },
  { id: "favorite-stage", label: "최애 무대" },
];

export const EMPTY_STATE = {
  pageTitle: "아직 러브트리가 없어요",
  pageDescription:
    "처음 좋아하게 된 순간부터 하나씩 이어보세요",
  quickStartHeading: "어떤 순간부터 시작할까요?",
  primaryCtaLabel: "첫 순간 기록하기",
  secondaryCtaLabel: "예시 러브트리 보기",
} as const;
