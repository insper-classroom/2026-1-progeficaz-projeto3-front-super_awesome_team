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
            <a href="#quem-somos" className={styles.navLink}>Quem somos</a>
            <a href="#como-funciona" className={styles.navLink}>Como funciona</a>
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

      <section id="quem-somos" className={styles.section}>
        <h2>Quem somos</h2>
        <p>
          O Adapte nasceu para simplificar a forma como você organiza suas finanças em grupo.
          Sabemos que dividir contas pode gerar confusão, esquecimentos e até conflitos.
        </p>

        <p>
          Nossa proposta é trazer clareza, organização e transparência para que você e seu grupo
          possam focar no que realmente importa, sem dor de cabeça com dinheiro.
        </p>
      </section>

      <section id="como-funciona" className={styles.section}>
        <h2>Como funciona</h2>
        <p className={styles.sectionIntro}>
          Em três passos, tudo fica claro.
        </p>

        <div className={styles.stepsGrid}>
          <article className={styles.stepCard}>
            <h3>Crie um grupo</h3>
            <p>Monte um grupo para amigos, família ou colegas e centralize tudo em um só lugar.</p>
          </article>

          <article className={styles.stepCard}>
            <h3>Registre os gastos</h3>
            <p>Adicione despesas e indique quem participou para manter o controle organizado.</p>
          </article>

          <article className={styles.stepCard}>
            <h3>Realize sonhos</h3>
            <p>Registre suas metas e acompanhe a realização de seus sonhos passo a passo</p>
          </article>
        </div>
      </section>



    </div>
  )
}
