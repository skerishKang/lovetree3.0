/**
 * LT3-MEDIA-001 — 정적 목업 데이터
 * 실제 API/Firebase 호출 없음
 * 실제 사용자 정보·UID·이메일·외부 영상 ID 없음
 */

export interface MediaSearchResult {
  id: string;
  title: string;
  date: string;
  channelName: string;
  thumbnailColorKey: string;
  duration: string;
  contentType: string;
  tags: string[];
  treeName: string;
}

export interface MediaSearchContext {
  searchQuery: string;
  resultCount: number;
  sourceScope: string;
  recentKeywords: string[];
  selectedCategory: string;
}

export const MOCK_MEDIA_CONTEXT: MediaSearchContext = {
  searchQuery: "무대 직캠 상랑크 검색",
  resultCount: 6,
  sourceScope: "YouTube · 전체 채널",
  recentKeywords: ["컴백 무대", "직캠 모음", "콘서트 하이라이트", "데뷔 무대"],
  selectedCategory: "무대",
};

export const MOCK_MEDIA_RESULTS: MediaSearchResult[] = [
  {
    id: "media-1",
    title: "2025 어워즈 직캠",
    date: "2025. 01. 15.",
    channelName: "팬채널 직캠",
    thumbnailColorKey: "purple",
    duration: "3:42",
    contentType: "직캠",
    tags: ["직캠", "무대"],
    treeName: "MY_STARLINE",
  },
  {
    id: "media-2",
    title: "컴백 쇼케이스 무대",
    date: "2025. 02. 03.",
    channelName: "공식 채널",
    thumbnailColorKey: "blue",
    duration: "12:15",
    contentType: "컴백",
    tags: ["컴백", "쇼케이스"],
    treeName: "MY_STARLINE",
  },
  {
    id: "media-3",
    title: "팬미팅 하이라이트",
    date: "2024. 12. 20.",
    channelName: "럽트리 기록",
    thumbnailColorKey: "pink",
    duration: "8:30",
    contentType: "콘서트",
    tags: ["팬미팅", "하이라이트"],
    treeName: "MY_STARLINE",
  },
  {
    id: "media-4",
    title: "콘서트 앵콜 무대",
    date: "2024. 11. 10.",
    channelName: "라이브 클립",
    thumbnailColorKey: "green",
    duration: "5:20",
    contentType: "콘서트",
    tags: ["콘서트", "앵콜"],
    treeName: "MY_STARLINE",
  },
  {
    id: "media-5",
    title: "뮤직뱅크 출근길",
    date: "2025. 01. 28.",
    channelName: "팬채널 직캠",
    thumbnailColorKey: "brown",
    duration: "2:55",
    contentType: "직캠",
    tags: ["직캠", "출근길"],
    treeName: "MY_STARLINE",
  },
  {
    id: "media-6",
    title: "음악방송 1위 무대",
    date: "2025. 03. 12.",
    channelName: "공식 채널",
    thumbnailColorKey: "purple",
    duration: "4:10",
    contentType: "무대",
    tags: ["무대", "1위"],
    treeName: "MY_STARLINE",
  },
];

export const MEDIA_CATEGORIES = ["무대", "직캠", "컴백", "콘서트"] as const;
