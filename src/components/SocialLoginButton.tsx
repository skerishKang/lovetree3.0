import type { MouseEvent } from "react";
import styles from "./SocialLoginButton.module.css";

interface Props {
  icon: string;
  label: string;
  variant?: "primary" | "secondary";
}

export default function SocialLoginButton({ icon, label, variant = "secondary" }: Props) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    /* No authentication — BASE placeholder only */
  };

  return (
    <button
      type="button"
      className={`${styles.socialBtn} ${variant === "primary" ? styles.primary : styles.secondary}`}
      onClick={handleClick}
      aria-label={label}
    >
      <span className={styles.btnIcon}>{icon}</span>
      {label}
    </button>
  );
}