import styles from "./SocialLoginButton.module.css";

interface Props {
  icon: string;
  label: string;
  variant: "primary" | "secondary";
}

export default function SocialLoginButton({ icon, label, variant }: Props) {
  return (
    <button
      type="button"
      className={`${styles.socialBtn} ${styles[variant]}`}
      aria-label={label}
      disabled
    >
      <span className={styles.btnIcon}>{icon}</span>
      {label}
    </button>
  );
}
