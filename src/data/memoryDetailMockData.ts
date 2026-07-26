export interface MediaMeta {
  source: string;
  format: string;
  duration: string;
  youtubeUrl: string;
}

export interface AuthorContext {
  name: string;
  treeName: string;
  treeRelation: string;
}

export interface ActionState {
  liked: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

export interface RelatedMemory {
  id: string;
  title: string;
  date: string;
  type: string;
  relation: string;
  description: string;
  thumbnailColorKey: string;
}

export interface MemoryDetailMockData {
  title: string;
  date: string;
  memoryType: string;
  tags: string[];
  memo: string;
  media: MediaMeta;
  author: AuthorContext;
  actions: ActionState;
  relatedMemories: RelatedMemory[];
}

export const MOCK_MEMORY_DETAIL: MemoryDetailMockData = {
  title: "첫 콘서트 직캠",
  date: "2023. 12. 25.",
  memoryType: "영상",
  tags: ["#콘서트", "#직캠", "#크리스마스"],
  memo: "정말 행복했던 첫 콘서트 순간이에요.\n처음으로 직캠을 찍어봤는데, 손이 떨려서 흔들렸지만 그래도 소중한 기록이 되었어요.\n다음 콘서트도 꼭 가야겠어요!\n\n오프닝 곡이 울려 퍼지는 순간, 온몸에 소름이 돋았어요. 눈앞에서 펼쳐지는 조명과 함께 좋아하는 아티스트의 목소리가 공간을 가득 채웠죠.\n\n콘서트장에서 만난 팬朋友们과 함께 응원법을 외치던 것도 잊지 못해요. 같은 마음으로 모인 사람들과 나누는 에너지는 정말 특별했습니다.\n\n집으로 돌아가는 기차 안에서 틈틈이 영상을 돌려보면서, 이 순간을 오래 기억하고 싶다는 생각을 했어요.",
  media: {
    source: "직캠 (직접 촬영)",
    format: "MP4 · 1080p",
    duration: "3분 42초",
    youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
  },
  author: {
    name: "민지",
    treeName: "민지의 러브트리",
    treeRelation: "개인 기억",
  },
  actions: {
    liked: true,
    likeCount: 128,
    commentCount: 17,
    shareCount: 5,
  },
  relatedMemories: [
    { id: "rel-1", title: "콘서트 준비 과정", date: "2023. 12. 24.", type: "사진", relation: "이전 기억", description: "콘서트 가기 전에 설레서 잠이 안 왔던 순간", thumbnailColorKey: "pink" },
    { id: "rel-2", title: "콘서트 굿즈 언박싱", date: "2023. 12. 26.", type: "사진", relation: "이어진 기억", description: "현장에서 구매한 굿즈들을 정리한 기록", thumbnailColorKey: "green" },
    { id: "rel-3", title: "콘서트 후 일기", date: "2023. 12. 27.", type: "텍스트", relation: "이어진 기억", description: "콘서트가 끝나고 쓴 감동의 기록", thumbnailColorKey: "brown" },
    { id: "rel-4", title: "팬미팅 초대장", date: "2024. 01. 10.", type: "문서", relation: "관련 기억", description: "콘서트에서 알게 된 팬분들이 초대해 준 팬미팅", thumbnailColorKey: "blue" },
  ],
};
