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
  typeLabel: string;
  mediaLabel: string;
  locationLabel?: string;
  reactionCount: number;
  connectionLabel: string;
  isFeatured?: boolean;
  accentVariant: string;
}

export interface TreeComment {
  id: string;
  author: string;
  authorHandle: string;
  avatar: string;
  text: string;
  likes: number;
  timestamp: string;
  timeLabel: string; // 상대 시간 label
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
  story: string;
  memoryCount: number;
  createdLabel: string;
  updatedLabel: string;
  category: string;
  treeTags: string[];
  viewCount: number;
  recordingPeriodLabel: string;
  featuredMemoryId: string;
}

export const MOCK_TREE_DETAIL: TreeDetailData = {
  title: "테스트 러버 A의 러브트리",
  subtitle: "입덕부터 지금까지 이어진 순간들",
  authorName: "테스트 러버 A",
  authorHandle: "@user.hanma",
  authorAvatar: "🎭",
  visibility: "전체공개",
  likeCount: 128,
  commentCount: 3,
  shareCount: 15,
  isLiked: false,
  isSaved: false,
  story: "아티스트와의 첫 만남인 유튜브 알고리즘의 우연한 이끌림부터 시작해, 첫 한정판 음반을 소장하고 콘서트 현장에서 소리 높여 응원했던 모든 빛나는 시간들을 기록해 둔 타임라인 공간입니다. 하나하나 스쳐 지나갈 수도 있었던 기억 조각들이 모여 저만의 작지만 소중한 울창한 러브트리를 만들었습니다.",
  memoryCount: 8,
  createdLabel: "2023-09-28",
  updatedLabel: "2024-08-01",
  category: "덕질일기 · 아티스트",
  treeTags: ["입덕일기", "콘서트후기", "최애곡", "평생덕질"],
  viewCount: 1420,
  recordingPeriodLabel: "2023.09.28 ~ 2024.08.01 (약 10개월)",
  featuredMemoryId: "mem-3",
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
      typeLabel: "무대 영상",
      mediaLabel: "YouTube 링크",
      locationLabel: "내 방 침대 위",
      reactionCount: 45,
      connectionLabel: "우상향 입덕의 시작점",
      isFeatured: false,
      accentVariant: "indigo",
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
      typeLabel: "음반 수집",
      mediaLabel: "실물 앨범 사진",
      locationLabel: "레코드샵 앞",
      reactionCount: 32,
      connectionLabel: "음악 감상의 깊이를 더함",
      isFeatured: false,
      accentVariant: "emerald",
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
      typeLabel: "콘서트 현장",
      mediaLabel: "4K 직캠 영상",
      locationLabel: "올림픽공원 체조경기장",
      reactionCount: 98,
      connectionLabel: "대표 기억이자 절정의 순간",
      isFeatured: true,
      accentVariant: "rose",
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
      typeLabel: "신보 발매",
      mediaLabel: "음원 스트리밍",
      locationLabel: "실시간 차트 스크린샷",
      reactionCount: 64,
      connectionLabel: "신곡 분석과 무한 반복",
      isFeatured: false,
      accentVariant: "amber",
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
      typeLabel: "오프라인 팬미팅",
      mediaLabel: "손편지 & 티켓 인증",
      locationLabel: "경희대 평화의전당",
      reactionCount: 77,
      connectionLabel: "양방향 소통의 소중한 감동",
      isFeatured: false,
      accentVariant: "purple",
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
      typeLabel: "공식 굿즈",
      mediaLabel: "언박싱 브이로그",
      locationLabel: "택배 수령지",
      reactionCount: 19,
      connectionLabel: "덕질 방 인테리어 추가",
      isFeatured: false,
      accentVariant: "cyan",
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
      typeLabel: "이벤트 참여",
      mediaLabel: "특전 컵홀더 & 엽서",
      locationLabel: "홍대 생일 카페거리",
      reactionCount: 50,
      connectionLabel: "팬덤 동료들과의 만남",
      isFeatured: false,
      accentVariant: "pink",
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
      typeLabel: "다큐멘터리",
      mediaLabel: "비하인드 클립",
      locationLabel: "방구석 시네마",
      reactionCount: 41,
      connectionLabel: "창작의 고뇌 공감",
      isFeatured: false,
      accentVariant: "teal",
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
      timeLabel: "2시간 전",
    },
    {
      id: "c-2",
      author: "타이마",
      authorHandle: "@taima_99",
      avatar: "🌸",
      text: "앨범 작업 과정 영상 저도 봤어요! 다음 앨범도 기대됩니다 💕",
      likes: 3,
      timestamp: "2024-08-03T12:15:00Z",
      timeLabel: "4시간 전",
    },
    {
      id: "c-3",
      author: "리온",
      authorHandle: "@lion_heart",
      avatar: "🦁",
      text: "러브트리 구경하고 갑니다~ 팬미팅 후기 너무 부러워요!",
      likes: 8,
      timestamp: "2024-08-02T23:45:00Z",
      timeLabel: "어제",
    },
  ],
};;
