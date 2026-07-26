import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { buildSafeReturnTarget } from "../context/authSession";
import styles from "./RequireAuth.module.css";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className={styles.loadingShell}>
        <p role="status" aria-live="polite" className={styles.loadingStatus}>
          로그인 상태를 확인하고 있습니다.
        </p>
      </main>
    );
  }

  if (!user) {
    const returnTo = buildSafeReturnTarget(location);

    return (
      <Navigate
        to="/login"
        replace
        state={returnTo ? { returnTo } : undefined}
      />
    );
  }

  return children;
}
