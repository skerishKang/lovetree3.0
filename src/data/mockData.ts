/**
 * LoveTree 3.0 홈 랜딩 — 정적 목업 데이터
 * 실제 API 호출 없음.
 */

export interface MemoryCardData {
  id: string;
  date: string;
  tags: string[];
  memo: string;
  youtubeUrl: string;
  /** 카드 위치 (%, tree container 기준) */
  position: { top: string; left: string };
  /** 카드 크기 배율 */
  scale: number;
}

export const memoryCards: MemoryCardData[] = [
  {
    id: "mem-001",
    date: "2023-01-07",
    tags: ["나상", "감정", "이시나"],
    memo: "처음 마주한 순간, 설렘이 피어났어요",
    youtubeUrl: "https://www.youtube.com/watch?v=c4V0FNZfEv0",
    position: { top: "68%", left: "4%" },
    scale: 0.82,
  },
  {
    id: "mem-002",
    date: "2023-01-10",
    tags: ["감상", "함께"],
    memo: "아론이 말아요 ❤️",
    youtubeUrl: "https://youtu.be/cMXk7cjr_tc",
    position: { top: "34%", left: "43%" },
    scale: 0.95,
  },
  {
    id: "mem-003",
    date: "2023-03-06",
    tags: ["현상", "감정"],
    memo: "이런 익숙함, 왠지 진짜 사랑잖아요 🥺",
    youtubeUrl: "https://www.youtube.com/watch?v=i0p1bmr0EmE",
    position: { top: "95%", left: "43%" },
    scale: 0.88,
  },
  {
    id: "mem-004",
    date: "2023-03-20",
    tags: ["성장", "이데이자"],
    memo: "영상 입력, 백일 차렸다...",
    youtubeUrl: "https://www.youtube.com/embed/c4V0FNZfEv0",
    position: { top: "20%", left: "88%" },
    scale: 1,
  },
  {
    id: "mem-005",
    date: "2023-05-17",
    tags: ["남상", "이어짐", "자라"],
    memo: "나쁘지 않아요",
    youtubeUrl: "https://www.youtube-nocookie.com/embed/cMXk7cjr_tc",
    position: { top: "95%", left: "88%" },
    scale: 1,
  },
];

export interface FeatureItemData {
  id: string;
  title: string;
  description: string;
  iconBg: string;
  iconType: "record" | "connect" | "replay" | "share";
}

export const featureItems: FeatureItemData[] = [
  {
    id: "feat-record",
    title: "기록하기",
    description: "러브트리에 순간을 남겨요. 영상, 사진, 감정까지 모두 기록할 수 있어요.",
    iconBg: "var(--feat-bg-record)",
    iconType: "record",
  },
  {
    id: "feat-connect",
    title: "연결하기",
    description: "기억들이 자연스럽게 이어져 나만의 사랑 흐름이 만들어져요.",
    iconBg: "var(--feat-bg-connect)",
    iconType: "connect",
  },
  {
    id: "feat-replay",
    title: "다시 보기",
    description: "언제든 지난 순간을 다시 꺼내 보며 그 감정을 되짚어요.",
    iconBg: "var(--feat-bg-replay)",
    iconType: "replay",
  },
  {
    id: "feat-share",
    title: "공유하기",
    description: "소중한 러브트리를 친구에게 공유하고 함께 기억해요.",
    iconBg: "var(--feat-bg-share)",
    iconType: "share",
  },
];

export const navMenuItems = ["About", "Features", "Community", "My Tree"] as const;
export const brandLogo = "Relovetree";
