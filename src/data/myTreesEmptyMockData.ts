/**
 * LT3-MY-TREES-002 — 마이 트리 빈 상태 정적 목업 데이터
 * 실제 API/Firebase 호출 없음
 * 실제 사용자 정보·UID·이메일·트리 ID 없음
 */

export interface QuickStartIdea {
  id: string;
  title: string;
  description: string;
  variant: "rose" | "sage" | "cream";
}

export const QUICK_START_IDEAS: QuickStartIdea[] = [
  {
    id: "first-love",
    title: "입덕",
    description: "처음 마음이 움직였던 순간부터 기록해 보세요.",
    variant: "rose",
  },
  {
    id: "first-concert",
    title: "첫 콘서트",
    description: "같은 공간에서 처음 만난 날을 한 장면으로 남겨보세요.",
    variant: "sage",
  },
  {
    id: "favorite-stage",
    title: "최애 무대",
    description: "오래 다시 보고 싶은 무대를 첫 기억으로 시작해 보세요.",
    variant: "cream",
  },
];

export const EMPTY_STATE = {
  pageTitle: "아직 러브트리가 없어요",
  pageDescription: "처음 좋아하게 된 순간부터 하나씩 이어보세요",
  quickStartHeading: "어떤 순간부터 시작할까요?",
  primaryCtaLabel: "첫 순간 기록하기",
  secondaryCtaLabel: "예시 러브트리 보기",
} as const;
