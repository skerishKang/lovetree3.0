/**
 * LT3-SETTINGS-001 — 정적 목업 데이터
 * 실제 API/Firebase 호출 없음
 * 실제 사용자 정보·UID·링크·토큰 없음
 */

export interface VisibilityOption {
  id: string;
  label: string;
  description: string;
  /** 아이콘 종류 식별 (목업) */
  iconType: "private" | "link" | "community";
}

export const VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    id: "private",
    label: "나만 보기",
    description: "본인만 러브트리를 볼 수 있습니다.",
    iconType: "private",
  },
  {
    id: "link",
    label: "링크를 가진 사람만",
    description: "링크를 알고 있는 사람에게만 러브트리가 공개됩니다.",
    iconType: "link",
  },
  {
    id: "community",
    label: "커뮤니티에 공개",
    description: "모든 LoveTree 사용자가 커뮤니티에서 러브트리를 검색하고 볼 수 있습니다.",
    iconType: "community",
  },
];

export interface AdditionalSetting {
  id: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}

export const ADDITIONAL_SETTINGS: AdditionalSetting[] = [
  {
    id: "allow-comments",
    label: "댓글 허용",
    description: "내 러브트리에 다른 사용자가 댓글을 남길 수 있습니다.",
    defaultChecked: true,
  },
  {
    id: "allow-likes",
    label: "좋아요 허용",
    description: "내 러브트리에 좋아요 표현을 받을 수 있습니다.",
    defaultChecked: true,
  },
  {
    id: "show-profile-name",
    label: "프로필 표시 이름 공개",
    description: "러브트리 옆에 내 프로필 표시 이름을 공개합니다.",
    defaultChecked: false,
  },
];

/** 정적 공유 링크 표시 (실제 서비스 URL·토큰·사용자 ID 없음) */
export const SHARE_LINK_PLACEHOLDER =
  "https://example.invalid/share/demo-tree";
