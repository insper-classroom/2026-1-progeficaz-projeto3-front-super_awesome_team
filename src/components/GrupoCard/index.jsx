import styles from "./GrupoCard.module.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Card({ title, subtitle, image, onClick }) {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={styles.card}
      onClick={onClick ?? (() => navigate(`/grupo/${title}`))}
    >
      {/* skeleton enquanto carrega */}
      {!loaded && <div className={styles.skeleton}></div>}

      <img
        src={image}
        className={styles.image}
        onLoad={() => setLoaded(true)}
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease"
        }}
      />

      <div className={styles.overlay}></div>

      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
    </div>
  );
}