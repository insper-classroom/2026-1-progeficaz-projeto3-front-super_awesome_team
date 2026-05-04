import styles from "./GrupoCard.module.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function GrupoCard({
  id,
  title,
  subtitle,
  image,
  onClick,
  onEdit,
}) {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  function handleClick() {
    if (onClick) {
      onClick();
      return;
    }

    navigate(`/grupos/${id}`);
  }

  return (
    <div className={styles.card} onClick={handleClick}>
      {!loaded && <div className={styles.skeleton} />}

      <img
        src={image}
        className={styles.image}
        onLoad={() => setLoaded(true)}
        alt={title}
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      <div className={styles.overlay} />

      <button
        type="button"
        className={styles.btnEditar}
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.();
        }}
      >
        Editar
      </button>

      <div className={styles.content}>
        <div>
          <div className={styles.title}>{title}</div>
          <div className={styles.subtitle}>{subtitle}</div>
        </div>
      </div>
    </div>
  );
}