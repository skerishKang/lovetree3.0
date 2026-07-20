/**
 * LT3-AUTH-001 — Auth mock data
 *
 * Static mock data for login screen.
 * No actual user data, API calls, or authentication.
 */

export interface AuthFeature {
  id: string;
  icon: string;
  label: string;
}

export const APP_BRAND = "Relovetree";

export const LOGIN_HEADING = "내 러브트리를 계속 이어가려면 로그인하세요";

export const LOGIN_DESCRIPTION =
  "기록한 순간을 안전하게 저장하고, 다른 기기에서도 이어서 볼 수 있어요";

export const LOGIN_BUTTONS = [
  { id: "google", label: "구글 계정으로 계속하기", icon: "G" },
  { id: "email", label: "이메일로 로그인", icon: "✉" },
] as const;

export const PREVIEW_PROFILE = {
  avatarInitial: "A",
  displayName: "테스트 러버 A",
};

export const AUTH_FEATURES: AuthFeature[] = [
  { id: "save", icon: "💾", label: "기록 저장" },
  { id: "share", icon: "🔗", label: "공유 관리" },
  { id: "alarm", icon: "🔔", label: "댓글 알림" },
  { id: "sync", icon: "🔄", label: "내 트리 동기화" },
];

export const LEGAL_NOTICE =
  "로그인하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.";
