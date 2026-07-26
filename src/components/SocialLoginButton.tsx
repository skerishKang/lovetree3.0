import styles from "./SocialLoginButton.module.css";

interface Props {
  icon: string;
  label: string;
  variant: "primary" | "secondary";
  disabled?: boolean;
  pending?: boolean;
  describedBy?: string;
  onClick?: () => void;
}

export default function SocialLoginButton({
  icon,
  label,
  variant,
  disabled = false,
  pending = false,
  describedBy,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className={`${styles.socialBtn} ${styles[variant]}`}
      aria-label={label}
      aria-busy={pending || undefined}
      aria-describedby={describedBy}
      disabled={disabled || pending}
      onClick={onClick}
    >
      <span className={styles.btnIcon}>{icon}</span>
      <span>{pending ? "로그인 중..." : label}</span>
    </button>
  );
}
