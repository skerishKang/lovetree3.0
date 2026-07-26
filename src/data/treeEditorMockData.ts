export interface TreeEditorMemoryCard {
  id: string;
  title: string;
  description: string;
  date: string;
  typeLabel: string;
  mediaFormat: string;
  source: string;
  duration: string;
  youtubeUrl?: string;
  thumbnailColorKey: "rose" | "amber" | "sage" | "lavender" | "sky" | "coral";
  tags: string[];
  parentId: string | null;
  childIds: string[];
}

export interface TreeConnector {
  id: string;
  fromId: string;
  toId: string;
  highlighted: boolean;
}

export interface TreeEditorMockData {
  screenTitle: string;
  treeTitle: string;
  treeDescription: string;
  visibility: "public" | "private";
  selectedMemoryId: string;
  memories: TreeEditorMemoryCard[];
  connectors: TreeConnector[];
}

export const MOCK_TREE_EDITOR: TreeEditorMockData = {
  screenTitle: "러브트리 편집",
  treeTitle: "데뷔 무대 기록",
  treeDescription: "처음 무대를 본 날의 감정과 함께",
  visibility: "public",
  selectedMemoryId: "mem-2",
  connectors: [
    { id: "conn-1", fromId: "mem-1", toId: "mem-2", highlighted: false },
    { id: "conn-2", fromId: "mem-2", toId: "mem-3", highlighted: true },
    { id: "conn-3", fromId: "mem-2", toId: "mem-4", highlighted: false },
    { id: "conn-4", fromId: "mem-4", toId: "mem-5", highlighted: false },
  ],
  memories: [
    {
      id: "mem-1", title: "비디오 프레젠테이션", description: "첫 무대 영상과 함께하는 프레젠테이션",
      date: "2023.10.15", typeLabel: "비디오", mediaFormat: "YouTube", source: "공개 YouTube 공연 영상 예시", duration: "YouTube에서 확인",
      youtubeUrl: "https://www.youtube.com/watch?v=c4V0FNZfEv0", thumbnailColorKey: "sky",
      tags: ["#기억", "#추억", "#팬미팅"], parentId: null, childIds: ["mem-2"],
    },
    {
      id: "mem-2", title: "대기실 준비", description: "무대 오르기 전 대기실 분위기와 긴장감",
      date: "2023.10.15", typeLabel: "비디오", mediaFormat: "YouTube", source: "공개 YouTube 아티스트 영상 예시", duration: "YouTube에서 확인",
      youtubeUrl: "https://youtu.be/cMXk7cjr_tc", thumbnailColorKey: "rose",
      tags: ["#무대", "#대기실", "#긴장"], parentId: "mem-1", childIds: ["mem-3", "mem-4"],
    },
    {
      id: "mem-3", title: "팬들이 준비한 이벤트", description: "깜짝 이벤트에 감동한 순간, 팬들의 손편지",
      date: "2023.10.14", typeLabel: "이미지", mediaFormat: "JPEG", source: "팬 클럽 제공", duration: "-",
      thumbnailColorKey: "lavender", tags: ["#팬", "#이벤트", "#감동"], parentId: "mem-2", childIds: [],
    },
    {
      id: "mem-4", title: "무대 위 첫인사", description: "첫 멘트를 연습하던 순간, 떨림과 설렘",
      date: "2023.10.13", typeLabel: "비디오", mediaFormat: "YouTube", source: "공개 YouTube 공식 영상 예시", duration: "YouTube에서 확인",
      youtubeUrl: "https://www.youtube.com/watch?v=i0p1bmr0EmE", thumbnailColorKey: "sage",
      tags: ["#무대", "#첫인사", "#리허설"], parentId: "mem-2", childIds: ["mem-5"],
    },
    {
      id: "mem-5", title: "앙코르 무대", description: "마지막 곡의 여운, 관객과 함께한 엔딩",
      date: "2023.10.12", typeLabel: "비디오", mediaFormat: "YouTube", source: "공개 YouTube 공연 영상 예시", duration: "YouTube에서 확인",
      youtubeUrl: "https://www.youtube-nocookie.com/embed/c4V0FNZfEv0", thumbnailColorKey: "coral",
      tags: ["#앙코르", "#무대", "#엔딩"], parentId: "mem-4", childIds: [],
    },
  ],
};
