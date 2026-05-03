import styles from "./Button.module.css";

export default function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant] || styles.primary}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}