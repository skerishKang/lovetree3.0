import { useRef, useState, type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./SiteHeader.module.css";
import { brandLogo, navMenuItems } from "../data/mockData";
import { useAuthContext } from "../context/AuthContext";
import { requestHashScrollActivation } from "./HashScrollRestoration";

const navRoutes: Record<(typeof navMenuItems)[number], string> = {
  About: "/#about",
  Features: "/#features",
  Community: "/community",
  "My Tree": "/my-trees",
};

const navLabels: Record<(typeof navMenuItems)[number], string> = {
  About: "소개",
  Features: "주요 기능",
  Community: "Community",
  "My Tree": "My Tree",
};

export default function SiteHeader() {
  const auth = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const logoutPendingRef = useRef(false);

  const handleAnchorActivation = (
    event: MouseEvent<HTMLAnchorElement>,
    destination: string,
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const hash = destination.slice(destination.indexOf("#"));
    if (location.pathname === "/" && location.hash === hash) {
      requestHashScrollActivation(hash);
    }
  };

  const handleLogout = async () => {
    if (!auth?.user || logoutPendingRef.current) {
      return;
    }

    logoutPendingRef.current = true;
    setLogoutPending(true);
    setLogoutError(null);

    try {
      await auth.signOut();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      logoutPendingRef.current = false;
      setLogoutPending(false);
    }
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        {brandLogo}
      </Link>
      <nav className={styles.nav} aria-label="주요 메뉴">
        {navMenuItems.map((item) => {
          const destination = navRoutes[item];
          const isHomeAnchor = destination.startsWith("/#");

          return (
            <Link
              key={item}
              className={styles.navItem}
              to={destination}
              onClick={
                isHomeAnchor
                  ? (event) => handleAnchorActivation(event, destination)
                  : undefined
              }
            >
              {navLabels[item]}
            </Link>
          );
        })}
      </nav>
      <div className={styles.authAction}>
        {auth?.user ? (
          <button
            type="button"
            className={`${styles.loginLink} ${styles.logoutButton}`}
            onClick={handleLogout}
            disabled={logoutPending}
            aria-label="로그아웃"
            aria-busy={logoutPending || undefined}
          >
            {logoutPending ? "로그아웃 중" : "로그아웃"}
          </button>
        ) : (
          <Link to="/login" className={styles.loginLink} aria-label="로그인">
            로그인
          </Link>
        )}
        {logoutError ? (
          <span role="status" aria-live="polite" className={styles.authStatus}>
            {logoutError}
          </span>
        ) : null}
      </div>
    </header>
  );
}
