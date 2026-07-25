import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthBrand from "./AuthBrand";
import LoginPanel from "./LoginPanel";
import AuthLegalNotice from "./AuthLegalNotice";
import styles from "./AuthLoginPage.module.css";
import { TRUST_CONTEXT } from "../data/authMockData";
import { getFirebaseAuthConfigStatus } from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import {
  AUTH_SESSION_EXPIRED_NOTICE,
  resolveSafeReturnTarget,
  type AuthNavigationState,
} from "../context/authSession";

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

export default function AuthLoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const pendingRef = useRef(false);
  const configStatus = useMemo(() => getFirebaseAuthConfigStatus(), []);
  const navigationState = location.state as AuthNavigationState | null;
  const returnTarget = resolveSafeReturnTarget(navigationState?.returnTo);

  useEffect(() => {
    if (!loading && user) {
      navigate(returnTarget, { replace: true });
    }
  }, [loading, navigate, returnTarget, user]);

  const handleGoogleSignIn = async () => {
    if (pendingRef.current || !configStatus.configured) {
      return;
    }

    pendingRef.current = true;
    setPending(true);
    setLocalMessage(null);

    try {
      await signInWithGoogle();
      // onIdTokenChanged owns the authenticated user state. Navigation occurs
      // from the effect above once AuthContext observes that user.
    } catch (error) {
      pendingRef.current = false;
      setPending(false);
      setLocalMessage(getGoogleSignInMessage(error));
    }
  };

  const statusMessage =
    localMessage ??
    (navigationState?.authNotice === AUTH_SESSION_EXPIRED_NOTICE
      ? "세션이 만료되었습니다. 다시 로그인해 주세요."
      : !configStatus.configured
        ? "현재 Google 로그인을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요."
        : pending
          ? "Google 로그인 창을 확인해 주세요."
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
            pending={pending}
            statusMessage={statusMessage}
            onGoogleSignIn={handleGoogleSignIn}
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
