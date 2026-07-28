import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthBrand from "./AuthBrand";
import LoginPanel from "./LoginPanel";
import AuthLegalNotice from "./AuthLegalNotice";
import styles from "./AuthLoginPage.module.css";
import { TRUST_CONTEXT } from "../data/authMockData";
import {
  getFirebaseAuthConfigStatus,
  signInWithEmail,
  signUpWithEmail,
} from "../api/auth";
import type { EmailAuthSubmitInput } from "./EmailAuthForm";
import { useAuth } from "../hooks/useAuth";
import {
  AUTH_SESSION_EXPIRED_NOTICE,
  resolveSafeReturnTarget,
  type AuthNavigationState,
} from "../context/authSession";

type PendingFlow = "google" | "email" | null;

function getGoogleSignInMessage(error: unknown): string {
  const reason =
    typeof error === "object" &&
    error !== null &&
    "reason" in error &&
    typeof error.reason === "string"
      ? error.reason
      : null;

  switch (reason) {
    case "popup-closed":
    case "popup-cancelled":
      return "로그인이 취소되었습니다. 다시 시도할 수 있습니다.";
    case "popup-blocked":
      return "팝업이 차단되었습니다. 브라우저에서 팝업을 허용한 뒤 다시 시도해 주세요.";
    case "config-unavailable":
      return "현재 Google 로그인을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
    default:
      return "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }
}

function readEmailAuthReason(error: unknown): string | null {
  return typeof error === "object" &&
    error !== null &&
    "reason" in error &&
    typeof error.reason === "string"
    ? error.reason
    : null;
}

function getEmailAuthMessage(reason: string | null): string {
  switch (reason) {
    case "invalid-email":
      return "이메일 형식이 올바르지 않습니다. 다시 확인해 주세요.";
    case "empty-password":
      return "비밀번호를 입력해 주세요.";
    case "input-too-long":
      return "입력 값이 너무 깁니다. 다시 확인해 주세요.";
    case "email-already-in-use":
      return "이미 사용 중인 이메일입니다. 로그인해 주세요.";
    case "weak-password":
      return "비밀번호가 너무 약합니다. 더 긴 비밀번호를 사용해 주세요.";
    case "too-many-requests":
      return "시도 횟수가 많습니다. 잠시 후 다시 시도해 주세요.";
    case "network-request-failed":
      return "네트워크 연결을 확인한 뒤 다시 시도해 주세요.";
    case "operation-not-allowed":
    case "config-unavailable":
      return "현재 이메일 로그인을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
    case "user-not-found":
    case "wrong-password":
    case "invalid-credential":
      return "이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해 주세요.";
    default:
      return "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }
}

export default function AuthLoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingFlow, setPendingFlow] = useState<PendingFlow>(null);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [statusFocusToken, setStatusFocusToken] = useState(0);
  const pendingRef = useRef(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const configStatus = useMemo(() => getFirebaseAuthConfigStatus(), []);
  const navigationState = location.state as AuthNavigationState | null;
  const returnTarget = resolveSafeReturnTarget(navigationState?.returnTo);

  useEffect(() => {
    if (!loading && user) {
      navigate(returnTarget, { replace: true });
    }
  }, [loading, navigate, returnTarget, user]);

  useEffect(() => {
    if (statusFocusToken > 0) {
      statusRef.current?.focus();
    }
  }, [statusFocusToken]);

  const handleGoogleSignIn = async () => {
    if (pendingRef.current || !configStatus.configured) {
      return;
    }

    pendingRef.current = true;
    setPendingFlow("google");
    setLocalMessage(null);

    try {
      await signInWithGoogle();
      // onIdTokenChanged owns the authenticated user state. Navigation occurs
      // from the effect above once AuthContext observes that user.
    } catch (error) {
      pendingRef.current = false;
      setPendingFlow(null);
      setLocalMessage(getGoogleSignInMessage(error));
    }
  };

  const handleEmailSubmit = async (input: EmailAuthSubmitInput) => {
    if (pendingRef.current || !configStatus.configured) {
      return;
    }

    pendingRef.current = true;
    setPendingFlow("email");
    setLocalMessage(null);

    try {
      if (input.mode === "signup") {
        await signUpWithEmail(input.email, input.password);
      } else {
        await signInWithEmail(input.email, input.password);
      }
      // onIdTokenChanged owns the authenticated user state. Navigation occurs
      // from the effect above once AuthContext observes that user.
    } catch (error) {
      pendingRef.current = false;
      setPendingFlow(null);
      setLocalMessage(getEmailAuthMessage(readEmailAuthReason(error)));
      setStatusFocusToken((token) => token + 1);
    }
  };

  const statusMessage =
    localMessage ??
    (navigationState?.authNotice === AUTH_SESSION_EXPIRED_NOTICE
      ? "세션이 만료되었습니다. 다시 로그인해 주세요."
      : !configStatus.configured
        ? "현재 로그인을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요."
        : pendingFlow === "google"
          ? "Google 로그인 창을 확인해 주세요."
          : pendingFlow === "email"
            ? "로그인 처리 중입니다. 잠시만 기다려 주세요."
            : null);

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <section className={styles.brandColumn}>
          <AuthBrand />
        </section>

        <section className={styles.loginColumn}>
          <LoginPanel
            configured={configStatus.configured}
            googlePending={pendingFlow === "google"}
            emailPending={pendingFlow === "email"}
            statusMessage={statusMessage}
            statusRef={statusRef}
            onGoogleSignIn={handleGoogleSignIn}
            onEmailSubmit={handleEmailSubmit}
          />
        </section>

        <div className={styles.legalRow}>
          <AuthLegalNotice />
          <Link to="/community" className={styles.communityLink}>
            커뮤니티 둘러보기
          </Link>
        </div>
      </div>
      <section className={styles.trustContext} aria-labelledby="auth-trust-title">
        <h2 id="auth-trust-title">{TRUST_CONTEXT.title}</h2>
        <p>{TRUST_CONTEXT.description}</p>
      </section>
    </div>
  );
}
