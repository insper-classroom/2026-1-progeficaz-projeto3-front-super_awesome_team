import styles from "./Card.module.css";
import { useNavigate } from "react-router-dom";

export default function Card({ title, value, subtitle, image }) {
  const navigate = useNavigate();

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/grupo/${title}`)}
    >
      <img src={image} className={styles.image} />
      <div className={styles.overlay}></div>

      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.value}>{value}</div>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
    </div>
  );
}