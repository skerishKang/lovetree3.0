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
  description: string;
}

export const APP_BRAND = "LoveTree";

export const LOGIN_HEADING = "LoveTree에 계속 이어가려면 로그인하세요";

export const LOGIN_DESCRIPTION =
  "기록한 순간을 안전하게 개인 공간에 저장하고, 다른 기기에서도 이어서 볼 수 있어요";

export const LOGIN_BUTTONS = [
  { id: "google", label: "Google 계정으로 계속하기", icon: "G", variant: "primary" },
  { id: "email", label: "이메일로 로그인", icon: "✉", variant: "secondary" },
] as const;

export const PREVIEW_PROFILE = {
  avatarInitial: "A",
  displayName: "테스트 러버 A",
};

export const TRUST_CONTEXT = {
  title: "개인 공간에서 시작됩니다",
  description: "당신의 기록은 모두 개인 공간에서 안전하게 보관됩니다.",
};

export const AUTH_FEATURES: AuthFeature[] = [
  {
    id: "archive",
    icon: "📚",
    label: "개인 아카이브",
    description: "모든 기록을 개인 공간에서 보관하고 관리하세요",
  },
  {
    id: "sync",
    icon: "🔄",
    label: "동기화",
    description: "여러 기기에서 기록을 원활하게 이어가세요",
  },
  {
    id: "connect",
    icon: "🔗",
    label: "연결",
    description: "소중한 순간을 친구와 공유하고 연결하세요",
  },
];

export const LEGAL_NOTICE =
  "로그인하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.";