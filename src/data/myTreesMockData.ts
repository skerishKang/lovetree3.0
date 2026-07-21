export type TreeVisibility = "public" | "private";

export interface MyTreeCard {
  id: string;
  title: string;
  description: string;
  visibility: TreeVisibility;
  memoryCount: number;
  updatedAt: string;
  thumbnailColorKey: "rose" | "amber" | "sage" | "lavender" | "sky" | "coral";
  views: number;
  likes: number;
  comments: number;
}

export interface MyTreesMockData {
  headerTitle: string;
  headerDescription: string;
  newTreeCtaText: string;
  cardsTitle: string;
  sidebarTitle: string;
  recentMoments: RecentMoment[];
  trees: MyTreeCard[];
  selectedTreeId: string;
}

export interface RecentMoment {
  id: string;
  title: string;
  updatedAt: string;
  thumbnailColorKey: "rose" | "amber" | "sage" | "lavender" | "sky" | "coral";
}

export const MOCK_MY_TREES: MyTreesMockData = {
  headerTitle: "나의 러브트리",
  headerDescription: "지금까지 이어온 기억의 흐름을 한 곳에서 돌아보세요.",
  newTreeCtaText: "새 러브트리 만들기",
  cardsTitle: "나의 러브트리",
  sidebarTitle: "최근 수정한 순간",
  recentMoments: [
    {
      id: "moment-1",
      title: "첫 콘서트 도착",
      updatedAt: "2025.03.12",
      thumbnailColorKey: "rose",
    },
    {
      id: "moment-2",
      title: "앙코르 무대",
      updatedAt: "2025.03.10",
      thumbnailColorKey: "lavender",
    },
  ],
  trees: [
    {
      id: "tree-1",
      title: "나의 러브트리",
      description: "처음 좋아하게 된 순간부터 지금까지",
      visibility: "public",
      memoryCount: 108,
      updatedAt: "2025.03.12",
      thumbnailColorKey: "rose",
      views: 1280,
      likes: 96,
      comments: 12,
    },
    {
      id: "tree-2",
      title: "데뷔 무대 기록",
      description: "처음 무대를 본 날의 감정",
      visibility: "private",
      memoryCount: 49,
      updatedAt: "2025.03.05",
      thumbnailColorKey: "amber",
      views: 0,
      likes: 0,
      comments: 0,
    },
    {
      id: "tree-3",
      title: "콘서트 투어",
      description: "도시마다 이어진 기억",
      visibility: "private",
      memoryCount: 86,
      updatedAt: "2025.02.20",
      thumbnailColorKey: "sage",
      views: 0,
      likes: 0,
      comments: 0,
    },
    {
      id: "tree-4",
      title: "팬미팅 모음",
      description: "처음 마주한 순간들",
      visibility: "public",
      memoryCount: 293,
      updatedAt: "2025.02.08",
      thumbnailColorKey: "lavender",
      views: 742,
      likes: 58,
      comments: 9,
    },
    {
      id: "tree-5",
      title: "예능 출연 모음",
      description: "화면 속 웃음 기억",
      visibility: "private",
      memoryCount: 66,
      updatedAt: "2025.01.30",
      thumbnailColorKey: "sky",
      views: 0,
      likes: 0,
      comments: 0,
    },
    {
      id: "tree-6",
      title: "일상 기록",
      description: "매일 이어지는 작은 기억",
      visibility: "private",
      memoryCount: 23,
      updatedAt: "2025.01.18",
      thumbnailColorKey: "coral",
      views: 0,
      likes: 0,
      comments: 0,
    },
  ],
  selectedTreeId: "tree-1",
};
