import type { MouseEvent } from "react";
import styles from "./SocialLoginButton.module.css";

interface Props {
  icon: string;
  label: string;
}

export default function SocialLoginButton({ icon, label }: Props) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    /* No authentication — BASE placeholder only */
  };

  return (
    <button
      type="button"
      className={styles.socialBtn}
      onClick={handleClick}
      aria-label={label}
    >
      <span className={styles.btnIcon}>{icon}</span>
      {label}
    </button>
  );
}
