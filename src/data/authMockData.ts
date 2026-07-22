/**
 * LT3-AUTH-001 — Auth mock data
 *
 * Static mock data for login screen.
 * No actual user data, API calls, or authentication.
 */

export const APP_BRAND = "Relovetree";

export const LOGIN_HEADING = "내 러브트리를 계속 이어가려면 로그인하세요";

export const LOGIN_DESCRIPTION =
  "기록한 순간을 안전하게 저장하고, 다른 기기에서도 이어서 볼 수 있어요";

export interface AuthFeature {
  id: string;
  label: string;
  description: string;
}

export const TRUST_CONTEXT = {
  title: "기록은 개인 공간에서 시작됩니다",
  description:
    "로그인한 뒤 나만의 기록을 이어가고, 공개 범위는 필요할 때 직접 선택할 수 있어요.",
};

export const LOGIN_BUTTONS = [
  {
    id: "google",
    label: "구글 계정으로 계속하기",
    icon: "G",
    variant: "primary",
  },
  {
    id: "email",
    label: "이메일로 로그인",
    icon: "✉",
    variant: "secondary",
  },
] as const;

export const PREVIEW_PROFILE = {
  avatarInitial: "A",
  displayName: "테스트 러버 A",
};

export const AUTH_FEATURES: AuthFeature[] = [
  {
    id: "save",
    label: "기록 저장",
    description: "매 순간을 소중히 저장하세요.",
  },
  {
    id: "share",
    label: "공유 관리",
    description: "사랑하는 사람과 기록을 공유하세요.",
  },
  {
    id: "alarm",
    label: "댓글 알림",
    description: "소중한 순간에 대한 알림을 받으세요.",
  },
];

export const LEGAL_NOTICE =
  "로그인하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.";
