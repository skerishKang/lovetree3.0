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
}

export const MOCK_MEDIA_RESULTS: MediaSearchResult[] = [
  {
    id: "media-1",
    title: "2025 어워즈 직캠",
    date: "2025. 01. 15.",
    channelName: "팬채널 직캠",
    thumbnailColorKey: "purple",
  },
  {
    id: "media-2",
    title: "컴백 쇼케이스 무대",
    date: "2025. 02. 03.",
    channelName: "공식 채널",
    thumbnailColorKey: "blue",
  },
  {
    id: "media-3",
    title: "팬미팅 하이라이트",
    date: "2024. 12. 20.",
    channelName: "럽트리 기록",
    thumbnailColorKey: "pink",
  },
  {
    id: "media-4",
    title: "콘서트 앵콜 무대",
    date: "2024. 11. 10.",
    channelName: "라이브 클립",
    thumbnailColorKey: "green",
  },
  {
    id: "media-5",
    title: "뮤직뱅크 출근길",
    date: "2025. 01. 28.",
    channelName: "팬채널 직캠",
    thumbnailColorKey: "brown",
  },
];

export const MEDIA_CATEGORIES = ["무대", "직캠", "컴백", "콘서트"] as const;
