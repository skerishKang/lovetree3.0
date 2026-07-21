export interface TreeEditorMemoryCard {
  id: string;
  title: string;
  description: string;
  date: string;
  thumbnailColorKey: "rose" | "amber" | "sage" | "lavender" | "sky" | "coral";
  tags: string[];
}

export interface TreeEditorMockData {
  screenTitle: string;
  treeTitle: string;
  treeDescription: string;
  visibility: "public" | "private";
  selectedMemoryId: string;
  memories: TreeEditorMemoryCard[];
}

export const MOCK_TREE_EDITOR: TreeEditorMockData = {
  screenTitle: "러브트리 편집",
  treeTitle: "데뷔 무대 기록",
  treeDescription: "처음 무대를 본 날의 감정과 함께",
  visibility: "public",
  selectedMemoryId: "mem-2",
  memories: [
    {
      id: "mem-1",
      title: "비디오 프레젠테이션",
      description: "첫 무대 영상과 함께",
      date: "2023.10.15",
      thumbnailColorKey: "sky",
      tags: ["#기억", "#추억", "#팬미팅"],
    },
    {
      id: "mem-2",
      title: "대기실 준비",
      description: "무대 오르기 전 대기실 분위기",
      date: "2023.10.15",
      thumbnailColorKey: "rose",
      tags: ["#무대", "#대기실"],
    },
    {
      id: "mem-3",
      title: "팬들이 준비한 이벤트",
      description: "깜짝 이벤트에 감동한 순간",
      date: "2023.10.14",
      thumbnailColorKey: "lavender",
      tags: ["#팬", "#이벤트"],
    },
    {
      id: "mem-4",
      title: "무대 위 첫인사",
      description: "첫 멘트 연습하던 순간",
      date: "2023.10.13",
      thumbnailColorKey: "sage",
      tags: ["#무대", "#첫인사"],
    },
    {
      id: "mem-5",
      title: "앙코르 무대",
      description: "마지막 곡의 여운",
      date: "2023.10.12",
      thumbnailColorKey: "coral",
      tags: ["#앙코르", "#무대"],
    },
  ],
};
