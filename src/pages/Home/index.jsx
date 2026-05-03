// Página de apresentação do produto — exibida antes do login
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

export function Home() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <img src="/logo-green.png" alt="" className={styles.bgLogo} />

      <div className={styles.navWrapper}>
        <nav className={styles.navbar}>
          <img src="/logo-white.png" alt="Adapte" className={styles.navLogo} />
          <div className={styles.navLinks}>
            <a className={styles.navLink}>Quem somos</a>
            <a className={styles.navLink}>Como funciona</a>
          </div>
          <button className={styles.btnEntrar} onClick={() => navigate('/login')}>
            Entrar
          </button>
        </nav>
      </div>

      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Chega de confusão, vem ser camaleão e
        </h1>
        <div className={styles.heroSpacer} />
        <p className={styles.heroSubtitle}>
          Somos o seu aplicativo de gerenciamento financeiro compartilhado
        </p>
        <button className={styles.btnComece} onClick={() => navigate('/cadastro')}>
          Comece agora
        </button>
      </div>
    </div>
  )
}
