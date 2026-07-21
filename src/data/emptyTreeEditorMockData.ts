/**
 * LT3-EDITOR-001 — EmptyTreeEditorPage UI BASE 정적 목업 데이터
 */

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}

export const SIDEBAR_MENU_ITEMS: SidebarMenuItem[] = [
  { id: "my-trees", label: "내 러브트리", icon: "🌳", active: true },
  { id: "explore", label: "탐색", icon: "🔍", active: false },
  { id: "settings", label: "설정", icon: "⚙️", active: false },
];
