/**
 * LoveTree 3.0 홈 랜딩 — 정적 목업 데이터
 *
 * 원본 이미지의 작은 한글 문구는 정확한 판독이 어려워
 * 시각 밀도와 레이아웃을 재현하는 목업 문구를 사용합니다.
 * 실제 API 호출 없음.
 *
 * 카드 위치는 원본 2752×1536px 이미지에서 추출한 비율 기준입니다.
 *
 * 2차 보정: 박사님이 제시한 정확한 anchor (2048×1143 기준)를
 * 2752×1536으로 변환 후 트리 컨테이너 내부 %로 재매핑.
 *
 * 원본 카드 구조 (3열 분기):
 *   mem-001 (시작):     좌측 열, 중간 높이
 *   mem-002 (중앙상단): 중앙 열, 상단
 *   mem-003 (중앙하단): 중앙 열, 하단
 *   mem-004 (우측상단): 우측 열, 상단
 *   mem-005 (우측하단): 우측 열, 하단
 *
 * 연결 구조 (원본 기준):
 *   mem-001 → mem-002 (시작 → 중앙 상단)
 *   mem-001 → mem-003 (시작 → 중앙 하단)
 *   mem-002 → mem-004 (중앙 상단 → 우측 상단)
 *   mem-003 → mem-005 (중앙 하단 → 우측 하단)
 *   mem-002 → mem-005 (중앙 상단 → 우측 하단, 교차 연결)
 */

export interface MemoryCardData {
  id: string;
  date: string;
  tags: string[];
  memo: string;
  /** 카드 위치 (%, tree container 기준) */
  position: { top: string; left: string };
  /** 카드 크기 배율 */
  scale: number;
  /** 보케 썸네일 색상 조합 */
  bokeh: {
    c1: string;
    c2: string;
    c3: string;
    base: string;
  };
}

export const memoryCards: MemoryCardData[] = [
  {
    id: "mem-001",
    date: "2023-01-07",
    tags: ["나상", "감정", "이시나"],
    memo: "처음 마주한 순간, 설렘이 피어났어요",
    /* 원본: 시작 카드, 좌측 열 중간 높이 (anchor: left 4.4%, top 68%) */
    position: { top: "68%", left: "4%" },
    scale: 0.82,
    bokeh: {
      c1: "rgba(255,244,200,0.85)",
      c2: "rgba(255,210,195,0.72)",
      c3: "rgba(255,255,235,0.58)",
      base: "linear-gradient(135deg, #897d76, #d8b9ac 45%, #8b9992)",
    },
  },
  {
    id: "mem-002",
    date: "2023-01-10",
    tags: ["감상", "함께"],
    memo: "아론이 말아요 ❤️",
    /* 원본: 중앙 열 상단 (anchor: left 43%, top 34%) */
    position: { top: "34%", left: "43%" },
    scale: 0.95,
    bokeh: {
      c1: "rgba(255,236,210,0.8)",
      c2: "rgba(220,189,182,0.7)",
      c3: "rgba(255,250,230,0.6)",
      base: "linear-gradient(135deg, #9a8a80, #c4a99f 50%, #88998e)",
    },
  },
  {
    id: "mem-003",
    date: "2023-03-06",
    tags: ["현상", "감정"],
    memo: "이런 익숙함, 왠지 진짜 사랑잖아요 🥺",
    /* 원본: 중앙 열 하단 (anchor: left 43%, top 100% → 컨테이너 내 95%) */
    position: { top: "95%", left: "43%" },
    scale: 0.88,
    bokeh: {
      c1: "rgba(255,240,195,0.82)",
      c2: "rgba(255,200,180,0.68)",
      c3: "rgba(240,255,225,0.55)",
      base: "linear-gradient(135deg, #8b8079, #d0b0a3 48%, #8b9992)",
    },
  },
  {
    id: "mem-004",
    date: "2023-03-20",
    tags: ["성장", "이데이자"],
    memo: "영상 입력, 백일 차렸다...",
    /* 원본: 우측 열 상단 (anchor: left 88%, top 20%) */
    position: { top: "20%", left: "88%" },
    scale: 1.0,
    bokeh: {
      c1: "rgba(255,245,205,0.85)",
      c2: "rgba(255,215,195,0.72)",
      c3: "rgba(255,255,240,0.6)",
      base: "linear-gradient(135deg, #92857d, #d8b9ac 45%, #8b9992)",
    },
  },
  {
    id: "mem-005",
    date: "2023-05-17",
    tags: ["남상", "이어짐", "자라"],
    memo: "나쁘지 않아요",
    /* 원본: 우측 열 하단 (anchor: left 88%, top 100% → 컨테이너 내 95%) */
    position: { top: "95%", left: "88%" },
    scale: 1.0,
    bokeh: {
      c1: "rgba(255,238,198,0.82)",
      c2: "rgba(255,205,190,0.68)",
      c3: "rgba(245,255,230,0.55)",
      base: "linear-gradient(135deg, #8a7e76, #d4b5a8 46%, #8b9992)",
    },
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
