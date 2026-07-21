/**
 * LoveTree 3.0 커뮤니티 탐색 — 정적 목업 데이터
 *
 * 기준 이미지: community-discovery.png (2752 × 1536px)
 * vision_analyze 추출값 기반. 작은 한글 문구는 정확한 판독이 어려워
 * 자연스러운 목업 문구를 사용합니다 (기준 원문으로 단정하지 않음).
 *
 * 실제 API 호출 없음. Firebase / LoveBud 연결 없음.
 */

export interface CommunityCategory {
  id: string;
  label: string;
}

export interface CommunityAuthor {
  handle: string;
  /** 아바타 배경 색 (목업) */
  avatarColor: string;
  /** 이니셜 표시용 */
  initial: string;
}

export interface CommunityTreeCard {
  id: string;
  /** 썸네일 배경 그라데이션 (목업 보케 스타일) */
  thumbnail: string;
  title: string;
  author: CommunityAuthor;
  tags: string[];
  likes: number;
  comments: number;
}

export interface FeaturedLoveTree {
  id: string;
  label: string;
  title: string;
  author: CommunityAuthor;
  previewNote: string;
  thumbnail: string;
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

export const communityTreeCards: CommunityTreeCard[] = [
  {
    id: "ct-001",
    thumbnail:
      "linear-gradient(135deg, #c9a0e0 0%, #d4b3ea 25%, #f0c9d8 50%, #f5d8e5 75%, #ffe0c2 100%)",
    title: "BTS - Map of the Soul 7 Memories",
    author: { handle: "@HappyArmy", avatarColor: "#e6a8c8", initial: "H" },
    tags: ["#감동", "#설렘"],
    likes: 256,
    comments: 42,
  },
  {
    id: "ct-002",
    thumbnail:
      "linear-gradient(135deg, #a8c8e6 0%, #b8d4f0 25%, #c9d8f0 50%, #d5e4f8 75%, #e0f0ff 100%)",
    title: "My First Stray Kids Concert",
    author: { handle: "@StayGold", avatarColor: "#a8c8e6", initial: "S" },
    tags: ["#설렘"],
    likes: 189,
    comments: 35,
  },
  {
    id: "ct-003",
    thumbnail:
      "linear-gradient(135deg, #e6c8a8 0%, #f0d4b8 25%, #f0e0c9 50%, #f5e8d5 75%, #fff0e0 100%)",
    title: "TWICE Comeback Cheer",
    author: { handle: "@ONCE_forever", avatarColor: "#f0c98a", initial: "O" },
    tags: ["#행복"],
    likes: 210,
    comments: 39,
  },
  {
    id: "ct-004",
    thumbnail:
      "linear-gradient(135deg, #c8a8e6 0%, #d4b8f0 25%, #d8c9f0 50%, #e0d5f8 75%, #e8e0ff 100%)",
    title: "ATEEZ Special Moments",
    author: { handle: "@ATINY_star", avatarColor: "#c8a8e6", initial: "A" },
    tags: ["#설렘"],
    likes: 153,
    comments: 28,
  },
  {
    id: "ct-005",
    thumbnail:
      "linear-gradient(135deg, #a8e6c8 0%, #b8f0d8 25%, #c9f0d8 50%, #d5f8e4 75%, #e0ffe8 100%)",
    title: "SEVENTEEN Fun Compilation",
    author: { handle: "@CARAT_love", avatarColor: "#a8e6c8", initial: "C" },
    tags: ["#웃음"],
    likes: 198,
    comments: 40,
  },
  {
    id: "ct-006",
    thumbnail:
      "linear-gradient(135deg, #e6c8a8 0%, #f0d4b8 25%, #f0d8c9 50%, #f5e0d5 75%, #ffe8e0 100%)",
    title: "NCT DREAM Debut Days",
    author: { handle: "@NCTzen_dream", avatarColor: "#e6b88a", initial: "N" },
    tags: ["#설렘"],
    likes: 175,
    comments: 31,
  },
  {
    id: "ct-007",
    thumbnail:
      "linear-gradient(135deg, #e6a8a8 0%, #f0b8b8 25%, #f0c9c9 50%, #f5d5d5 75%, #ffe0e0 100%)",
    title: "MONSTA X High Energy FanCam",
    author: { handle: "@Monbebe_X", avatarColor: "#e6a8a8", initial: "M" },
    tags: ["#박력"],
    likes: 230,
    comments: 45,
  },
  {
    id: "ct-008",
    thumbnail:
      "linear-gradient(135deg, #a8e6e6 0%, #b8f0f0 25%, #c9f0f0 50%, #d5f8f8 75%, #e0ffff 100%)",
    title: "NewJeans 'Ditto' Vibes",
    author: { handle: "@Bunnies_love", avatarColor: "#a8e6e6", initial: "B" },
    tags: ["#설렘"],
    likes: 201,
    comments: 37,
  },
];

export const featuredLoveTree: FeaturedLoveTree = {
  id: "feat-001",
  label: "Featured LoveTree",
  title: "OUR JOURNEY WITH RED VELVET",
  author: { handle: "@ReVeluv_Fan", avatarColor: "#b87a7a", initial: "R" },
  previewNote: "연결된 미니 트리 미리보기",
  thumbnail:
    "linear-gradient(160deg, #5c3a3a 0%, #6d4545 25%, #7a4a4a 50%, #8a5555 75%, #9a5a5a 100%)",
};
