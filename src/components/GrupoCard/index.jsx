import { useState } from 'react'
import { FiEdit2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import styles from './GrupoCard.module.css'

export default function GrupoCard({
  id,
  title,
  subtitle,
  image,
  onClick,
  onEdit,
}) {
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)

  function handleClick() {
    if (onClick) {
      onClick()
      return
    }

    navigate(`/grupos/${id}`)
  }

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.media}>
        {!loaded && <div className={styles.skeleton} />}

        <img
          src={image}
          className={styles.image}
          onLoad={() => setLoaded(true)}
          alt={title}
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      </div>

      <div className={styles.content}>
        <div>
          <div className={styles.title}>{title}</div>
          <div className={styles.subtitle}>{subtitle}</div>
        </div>

        <button
          type="button"
          className={styles.btnEditar}
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.()
          }}
          aria-label={`Editar ${title}`}
        >
          <FiEdit2 />
        </button>
      </div>
    </div>
  )
}
