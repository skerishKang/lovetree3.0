/**
 * LT3-MEMORY-002 — 정적 목업 데이터
 * 실제 API/Firebase 호출 없음
 * 실제 사용자 정보·UID·이메일 없음
 */

export interface RelatedMemory {
  id: string;
  title: string;
  date: string;
  description: string;
  thumbnailColorKey: string;
}

export interface MemoryDetailMockData {
  title: string;
  date: string;
  tags: string[];
  memo: string;
  likeCount: number;
  commentCount: number;
  relatedMemories: RelatedMemory[];
}

export const MOCK_MEMORY_DETAIL: MemoryDetailMockData = {
  title: "첫 콘서트 직캠",
  date: "2023. 12. 25.",
  tags: ["#콘서트", "#직캠", "#크리스마스"],
  memo: "정말 행복했던 첫 콘서트 순간이에요.\n처음으로 직캠을 찍어봤는데, 손이 떨려서 흔들렸지만 그래도 소중한 기록이 되었어요.\n다음 콘서트도 꼭 가야겠어요!",
  likeCount: 128,
  commentCount: 17,
  relatedMemories: [
    {
      id: "rel-1",
      title: "콘서트 준비 과정",
      date: "2023. 12. 24.",
      description: "콘서트 가기 전에 설레서 잠이 안 왔던 순간",
      thumbnailColorKey: "pink",
    },
    {
      id: "rel-2",
      title: "콘서트 굿즈 언박싱",
      date: "2023. 12. 26.",
      description: "현장에서 구매한 굿즈들을 정리한 기록",
      thumbnailColorKey: "green",
    },
    {
      id: "rel-3",
      title: "콘서트 후 일기",
      date: "2023. 12. 27.",
      description: "콘서트가 끝나고 쓴 감동의 기록",
      thumbnailColorKey: "brown",
    },
  ],
};
