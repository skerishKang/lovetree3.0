/**
 * LT3-EDITOR-001 — EmptyTreeEditorPage UI BASE 정적 목업 데이터
 */

export interface SidebarMenuItem {
  id: string;
  label: string;
}

export const SIDEBAR_MENU_ITEMS: SidebarMenuItem[] = [
  { id: "my-trees", label: "내 러브트리" },
  { id: "explore", label: "탐색" },
  { id: "settings", label: "설정" },
];
