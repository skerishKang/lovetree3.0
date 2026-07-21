/**
 * LT3-MEMORY-001 — 정적 목업 데이터
 * 실제 API/Firebase/localStorage 호출 없음
 * 고정 selected 노드 포함
 */

export interface MemoryConnectNode {
  id: string;
  date: string;
  title: string;
  tags: string[];
  emoji: string;
  colorKey: "green" | "pink" | "brown";
  description: string;
  typeLabel: string;
  mediaLabel: string;
}

export interface NewMemoryPreview {
  title: string;
  date: string;
  typeLabel: string;
  mediaLabel: string;
  tags: string[];
  description: string;
  emoji: string;
}

export interface MemoryConnectData {
  title: string;
  description: string;
  nodes: MemoryConnectNode[];
  newMemory: NewMemoryPreview;
  ctaText: string;
  selectedNodeId: string;
}

export const MOCK_MEMORY_CONNECT: MemoryConnectData = {
  title: "어느 순간과 연결할까요?",
  description: "기억을 선택하면 해당 순간 뒤에 새로운 기록이 추가됩니다.",
  ctaText: "이 순간 뒤에 연결하기",
  selectedNodeId: "mem-node-4",
  newMemory: {
    title: "첫 음악방송 1위",
    date: "2024. 1. 21.",
    typeLabel: "음악방송",
    mediaLabel: "TV 방송 녹화",
    tags: ["#음악방송", "#1위", "#컴백"],
    description: "컴백 후 첫 1위! 팬들이 만들어준 서프라이즈 응원봉과 함께.",
    emoji: "🏆",
  },
  nodes: [
    {
      id: "mem-node-1",
      date: "2023. 9. 28.",
      title: "첫 만남의 순간",
      tags: ["#첫만남"],
      emoji: "🎬",
      colorKey: "green",
      description: "유튜브 알고리즘으로 우연히 마주한 첫 무대 영상",
      typeLabel: "무대 영상",
      mediaLabel: "YouTube 링크",
    },
    {
      id: "mem-node-2",
      date: "2023. 10. 15.",
      title: "첫 앨범 구매",
      tags: ["#앨범", "#첫구매"],
      emoji: "💿",
      colorKey: "pink",
      description: "한정판 예약 구매 후 도착한 소중한 첫 앨범",
      typeLabel: "음반 수집",
      mediaLabel: "실물 앨범 사진",
    },
    {
      id: "mem-node-3",
      date: "2023. 11. 20.",
      title: "콘서트 직캠",
      tags: ["#콘서트", "#직캠"],
      emoji: "🎤",
      colorKey: "green",
      description: "첫 콘서트 현장에서 직접 찍은 4K 직캠",
      typeLabel: "콘서트 현장",
      mediaLabel: "4K 직캠 영상",
    },
    {
      id: "mem-node-4",
      date: "2024. 1. 7.",
      title: "컴백 D-Day",
      tags: ["#컴백", "#신곡"],
      emoji: "🌟",
      colorKey: "brown",
      description: "기다리고 기다리던 컴백! 신곡을 처음 들었을 때의 전율",
      typeLabel: "신보 발매",
      mediaLabel: "음원 스트리밍",
    },
  ],
};
