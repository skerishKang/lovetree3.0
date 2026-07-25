import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./SiteHeader.module.css";
import { brandLogo, navMenuItems } from "../data/mockData";
import { useAuthContext } from "../context/AuthContext";

const navRoutes: Record<typeof navMenuItems[number], string> = {
  About: "/#about",
  Features: "/#features",
  Community: "/community",
  "My Tree": "/my-trees",
};

export default function SiteHeader() {
  const auth = useAuthContext();
  const navigate = useNavigate();
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const logoutPendingRef = useRef(false);

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
        {navMenuItems.map((item) => (
          <Link
            key={item}
            className={styles.navItem}
            to={navRoutes[item]}
          >
            {item}
          </Link>
        ))}
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
