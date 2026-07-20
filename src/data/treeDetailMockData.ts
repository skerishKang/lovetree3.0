/**
 * LT3-TREE-DETAIL-001 — 정적 목업 데이터
 * 실제 API/Firebase 호출 없음
 */

export interface TimelineMemory {
  id: string;
  date: string;
  title: string;
  description: string;
  tags: string[];
  emoji: string; // 간단 이모지 아이콘
  side: "top" | "bottom"; // 중앙선 기준 위/아래
}

export interface TreeComment {
  id: string;
  author: string;
  authorHandle: string;
  avatar: string;
  text: string;
  likes: number;
  timestamp: string;
}

export interface TreeDetailData {
  title: string;
  subtitle: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  visibility: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isSaved: boolean;
  memories: TimelineMemory[];
  comments: TreeComment[];
}

export const MOCK_TREE_DETAIL: TreeDetailData = {
  title: "테스트 러버 A의 러브트리",
  subtitle: "입덕부터 지금까지 이어진 순간들",
  authorName: "테스트 러버 A",
  authorHandle: "@user.hanma",
  authorAvatar: "🎭",
  visibility: "전체공개",
  likeCount: 128,
  commentCount: 24,
  shareCount: 15,
  isLiked: false,
  isSaved: false,
  memories: [
    {
      id: "mem-1",
      date: "2023-09-28",
      title: "첫 만남 - 무대 영상",
      description:
        "처음으로 본 무대 영상. 그날의 감동을 잊을 수 없어요. 영상을 보며 함께 춤추고 노래했던 순간.",
      tags: ["첫만남", "무대"],
      emoji: "🎬",
      side: "top",
    },
    {
      id: "mem-2",
      date: "2023-10-15",
      title: "첫 앨범 구매 인증",
      description:
        "첫 앨범을 샀던 날. 한정판이라서 예약 주문했는데 드디어 도착했어요.",
      tags: ["앨범", "첫구매"],
      emoji: "💿",
      side: "bottom",
    },
    {
      id: "mem-3",
      date: "2023-11-20",
      title: "콘서트 직캠",
      description:
        "첫 콘서트! 직캠을 찍느라 정신없었지만 너무 행복했던 날.",
      tags: ["콘서트", "직캠"],
      emoji: "🎤",
      side: "top",
    },
    {
      id: "mem-4",
      date: "2024-01-07",
      title: "컴백 D-Day",
      description:
        "기다리고 기다리던 컴백! 신곡을 처음 들었을 때의 전율.",
      tags: ["컴백", "신곡"],
      emoji: "🌟",
      side: "bottom",
    },
    {
      id: "mem-5",
      date: "2024-02-14",
      title: "팬미팅 후기",
      description:
        "발렌타인데이 팬미팅. 멤버들한테 직접 편지를 전달했어요.",
      tags: ["팬미팅", "후기"],
      emoji: "💌",
      side: "top",
    },
    {
      id: "mem-6",
      date: "2024-04-01",
      title: "굿즈 수령",
      description:
        "시즌 그리팅과 MD 굿즈가 도착한 날. 구성이 알차서 감동.",
      tags: ["굿즈", "MD"],
      emoji: "🎁",
      side: "bottom",
    },
    {
      id: "mem-7",
      date: "2024-06-15",
      title: "생일 카페 이벤트",
      description:
        "멤버 생일 기념 카페 이벤트에 다녀왔어요. 팬들이 준비한 이벤트가 감동적이었어요.",
      tags: ["생일", "카페"],
      emoji: "🎂",
      side: "top",
    },
    {
      id: "mem-8",
      date: "2024-08-01",
      title: "앨범 작업 과정",
      description:
        "새 앨범 비하인드 영상을 보며 작업 과정을 느낄 수 있었던 순간.",
      tags: ["비하인드", "앨범"],
      emoji: "🎵",
      side: "bottom",
    },
  ],
  comments: [
    {
      id: "c-1",
      author: "아트라",
      authorHandle: "@atra_fan",
      avatar: "🎨",
      text: "첫 콘서트 직캠 정말 잘 봤어요! 저도 그날 갔었는데 감동이었죠 🥹",
      likes: 5,
      timestamp: "2024-08-03T14:30:00Z",
    },
    {
      id: "c-2",
      author: "타이마",
      authorHandle: "@taima_99",
      avatar: "🌸",
      text: "앨범 작업 과정 영상 저도 봤어요! 다음 앨범도 기대됩니다 💕",
      likes: 3,
      timestamp: "2024-08-03T12:15:00Z",
    },
    {
      id: "c-3",
      author: "리온",
      authorHandle: "@lion_heart",
      avatar: "🦁",
      text: "러브트리 구경하고 갑니다~ 팬미팅 후기 너무 부러워요!",
      likes: 8,
      timestamp: "2024-08-02T23:45:00Z",
    },
  ],
};
