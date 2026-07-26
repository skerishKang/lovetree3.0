/**
 * LoveTree 3.0 커뮤니티 탐색 — 정적 목업 데이터
 * 실제 API 호출 없음. Firebase / LoveBud 연결 없음.
 */

export interface CommunityCategory {
  id: string;
  label: string;
}

export interface CommunityAuthor {
  handle: string;
  avatarColor: string;
  initial: string;
}

export interface CommunityTreeCard {
  id: string;
  youtubeUrl: string;
  title: string;
  summary: string;
  author: CommunityAuthor;
  tags: string[];
  likes: number;
  comments: number;
  memoryCount: number;
  updatedLabel: string;
  category: string;
  visibilityLabel: string;
  previewVariant: string;
}

export interface FeaturedLoveTree {
  id: string;
  label: string;
  title: string;
  summary: string;
  author: CommunityAuthor;
  previewNote: string;
  thumbnail?: string;
  youtubeUrl: string;
  memoryCount: number;
  updatedLabel: string;
  likes: number;
  comments: number;
  tags: string[];
}

export const communityCategories: CommunityCategory[] = [
  { id: "popular", label: "인기" },
  { id: "latest", label: "최신" },
  { id: "stan", label: "입덕" },
  { id: "concert", label: "콘서트" },
  { id: "fancam", label: "직캠" },
  { id: "comeback", label: "컴백" },
];

export const communitySearchPlaceholder = "팬심 가득한 러브트리 검색";

const YOUTUBE_SAMPLE_URLS = [
  "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  "https://youtu.be/dQw4w9WgXcQ",
  "https://www.youtube.com/shorts/aqz-KE-bpKQ",
] as const;

export const communityTreeCards: CommunityTreeCard[] = [
  {
    id: "ct-001",
    youtubeUrl: YOUTUBE_SAMPLE_URLS[0],
    title: "BTS - Map of the Soul 7 Memories",
    summary: "첫 티저 공개부터 스타디움 투어의 불꽃놀이까지 담은 역사적 7년의 기록",
    author: { handle: "@HappyArmy", avatarColor: "#e6a8c8", initial: "H" },
    tags: ["#감동", "#설렘"], likes: 256, comments: 42, memoryCount: 18,
    updatedLabel: "2일 전 업데이트", category: "입덕", visibilityLabel: "공개", previewVariant: "variant-a",
  },
  {
    id: "ct-002", youtubeUrl: YOUTUBE_SAMPLE_URLS[1],
    title: "My First Stray Kids Concert",
    summary: "오프닝 무대의 베이스 비트부터 마지막 앙코르 소감까지 한 순간도 놓칠 수 없는 기억",
    author: { handle: "@StayGold", avatarColor: "#a8c8e6", initial: "S" },
    tags: ["#설렘"], likes: 189, comments: 35, memoryCount: 12,
    updatedLabel: "3일 전 업데이트", category: "콘서트", visibilityLabel: "공개", previewVariant: "variant-b",
  },
  {
    id: "ct-003", youtubeUrl: YOUTUBE_SAMPLE_URLS[2], title: "TWICE Comeback Cheer",
    summary: "컴백 쇼케이스 첫 방송부터 공방 대기실 음원 차트 1위 달성의 감격",
    author: { handle: "@ONCE_forever", avatarColor: "#f0c98a", initial: "O" },
    tags: ["#행복"], likes: 210, comments: 39, memoryCount: 15,
    updatedLabel: "5일 전 업데이트", category: "컴백", visibilityLabel: "공개", previewVariant: "variant-c",
  },
  {
    id: "ct-004", youtubeUrl: YOUTUBE_SAMPLE_URLS[0], title: "ATEEZ Special Moments",
    summary: "멤버별 레전드 킬링 파트와 무대 뒤 숨겨진 따뜻한 장난과 미소들",
    author: { handle: "@ATINY_star", avatarColor: "#c8a8e6", initial: "A" },
    tags: ["#설렘"], likes: 153, comments: 28, memoryCount: 8,
    updatedLabel: "1주일 전 업데이트", category: "직캠", visibilityLabel: "공개", previewVariant: "variant-d",
  },
  {
    id: "ct-005", youtubeUrl: YOUTUBE_SAMPLE_URLS[1], title: "SEVENTEEN Fun Compilation",
    summary: "13명의 우당탕탕 자체 예능 명장면부터 고잉 세븐틴 레전드 웃음 모음",
    author: { handle: "@CARAT_love", avatarColor: "#a8e6c8", initial: "C" },
    tags: ["#웃음"], likes: 198, comments: 40, memoryCount: 22,
    updatedLabel: "어제 업데이트", category: "인기", visibilityLabel: "공개", previewVariant: "variant-e",
  },
  {
    id: "ct-006", youtubeUrl: YOUTUBE_SAMPLE_URLS[2], title: "NCT DREAM Debut Days",
    summary: "츄잉검 호버보드 연습 영상부터 퍼스트 윈 눈물 글썽이던 풋풋한 날들",
    author: { handle: "@NCTzen_dream", avatarColor: "#e6b88a", initial: "N" },
    tags: ["#설렘"], likes: 175, comments: 31, memoryCount: 14,
    updatedLabel: "4일 전 업데이트", category: "최신", visibilityLabel: "공개", previewVariant: "variant-a",
  },
  {
    id: "ct-007", youtubeUrl: YOUTUBE_SAMPLE_URLS[0], title: "MONSTA X High Energy FanCam",
    summary: "연말 무대 셔츠 터지던 댄스 브레이크와 강렬한 비트 속 레전드 피지컬 직캠",
    author: { handle: "@Monbebe_X", avatarColor: "#e6a8a8", initial: "M" },
    tags: ["#박력"], likes: 230, comments: 45, memoryCount: 10,
    updatedLabel: "방금 전 업데이트", category: "직캠", visibilityLabel: "공개", previewVariant: "variant-b",
  },
  {
    id: "ct-008", youtubeUrl: YOUTUBE_SAMPLE_URLS[1], title: "NewJeans 'Ditto' Vibes",
    summary: "눈 내리던 교실의 아련한 캠코더 감성과 포근한 겨울 멜로디의 해석",
    author: { handle: "@Bunnies_love", avatarColor: "#a8e6e6", initial: "B" },
    tags: ["#설렘"], likes: 201, comments: 37, memoryCount: 9,
    updatedLabel: "6일 전 업데이트", category: "최신", visibilityLabel: "공개", previewVariant: "variant-c",
  },
];

export const featuredLoveTree: FeaturedLoveTree = {
  id: "feat-001",
  label: "Featured 러브트리",
  title: "OUR JOURNEY WITH RED VELVET",
  summary: "레드벨벳 10주년을 함께한 팬들의 소중한 콘서트 현장 열기와 미발매곡 최초 공개의 순간, 그리고 멤버들과 함께 울고 웃었던 추억의 타임라인을 총망라한 기념비적 트리.",
  author: { handle: "@ReVeluv_Fan", avatarColor: "#b87a7a", initial: "R" },
  previewNote: "연결된 미니 트리 미리보기",
  thumbnail: "linear-gradient(160deg, #5c3a3a 0%, #6d4545 25%, #7a4a4a 50%, #8a5555 75%, #9a5a5a 100%)",
  youtubeUrl: YOUTUBE_SAMPLE_URLS[2],
  memoryCount: 35,
  updatedLabel: "12시간 전 업데이트",
  likes: 852,
  comments: 124,
  tags: ["#레드벨벳", "#10주년", "#콘서트"],
};
