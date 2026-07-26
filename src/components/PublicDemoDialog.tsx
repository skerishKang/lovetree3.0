import { useEffect, useRef, type ReactNode } from "react";
import styles from "./PublicDemoEditor.module.css";

interface PublicDemoDialogProps {
  title: string;
  description: string;
  onCancel(): void;
  children: ReactNode;
}

export default function PublicDemoDialog({
  title,
  description,
  onCancel,
  children,
}: PublicDemoDialogProps) {
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    firstButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.setTimeout(() => returnFocusRef.current?.focus(), 0);
    };
  }, [onCancel]);

  return (
    <div className={styles.dialogBackdrop}>
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-demo-dialog-title"
        aria-describedby="public-demo-dialog-description"
      >
        <h2 id="public-demo-dialog-title">{title}</h2>
        <p id="public-demo-dialog-description">{description}</p>
        <div className={styles.dialogActions}>
          <button ref={firstButtonRef} type="button" className={styles.secondaryButton} onClick={onCancel}>
            취소
          </button>
          {children}
        </div>
      </section>
    </div>
  );
}
