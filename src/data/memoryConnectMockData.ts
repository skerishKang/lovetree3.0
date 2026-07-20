/**
 * LT3-MEMORY-001 — 정적 목업 데이터
 * 실제 API/Firebase 호출 없음
 * 고정 selected 노드 포함
 */

export interface MemoryConnectNode {
  id: string;
  date: string;
  title: string;
  tags: string[];
  emoji: string;
  /** muted 색상 키 — css 변수 매핑 */
  colorKey: "green" | "pink" | "brown";
  isSelected: boolean;
}

export interface MemoryConnectData {
  title: string;
  description: string;
  nodes: MemoryConnectNode[];
  ctaText: string;
  selectedNodeId: string;
}

export const MOCK_MEMORY_CONNECT: MemoryConnectData = {
  title: "어느 순간과 연결할까요?",
  description: "기억을 선택하면 해당 순간 뒤에 새로운 기록이 추가됩니다.",
  ctaText: "이 순간 뒤에 연결하기",
  selectedNodeId: "mem-node-4",
  nodes: [
    {
      id: "mem-node-1",
      date: "2023. 9. 28.",
      title: "첫 만남의 순간",
      tags: ["#첫만남"],
      emoji: "🎬",
      colorKey: "green",
      isSelected: false,
    },
    {
      id: "mem-node-2",
      date: "2023. 10. 15.",
      title: "첫 앨범 구매",
      tags: ["#앨범", "#첫구매"],
      emoji: "💿",
      colorKey: "pink",
      isSelected: false,
    },
    {
      id: "mem-node-3",
      date: "2023. 11. 20.",
      title: "콘서트 직캠",
      tags: ["#콘서트", "#직캠"],
      emoji: "🎤",
      colorKey: "green",
      isSelected: false,
    },
    {
      id: "mem-node-4",
      date: "2024. 1. 7.",
      title: "컴백 D-Day",
      tags: ["#컴백", "#신곡"],
      emoji: "🌟",
      colorKey: "brown",
      isSelected: true,
    },
  ],
};
