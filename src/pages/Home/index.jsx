// Página de apresentação do produto — exibida antes do login
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

const quemSomosCards = [
  {
    title: 'Transparência no grupo',
    description: 'Todos visualizam despesas, metas e movimentações sem ruídos na comunicação.',
  },
  {
    title: 'Organização simples',
    description: 'Você centraliza tudo em um fluxo claro, com menos retrabalho e menos confusão.',
  },
  {
    title: 'Foco no que importa',
    description: 'Com o financeiro resolvido, sobra energia para os objetivos do grupo.',
  },
]

const comoFuncionaPassos = [
  {
    title: 'Crie um grupo',
    description: 'Monte um grupo para amigos, família ou colegas e centralize tudo em um só lugar.',
  },
  {
    title: 'Registre os gastos',
    description: 'Adicione despesas e indique quem participou para manter o controle organizado.',
  },
  {
    title: 'Acompanhe as metas',
    description: 'Defina objetivos e acompanhe a evolução de forma visual até realizar seus sonhos.',
  },
]

export function Home() {
  const navigate = useNavigate()
  const pageRef = useRef(null)

  useEffect(() => {
    if (!pageRef.current) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealVisible)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -12% 0px' },
    )

    const revealElements = pageRef.current.querySelectorAll('[data-reveal]')
    revealElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.page} ref={pageRef}>

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

        <img src="/logo-green.png" alt="" className={styles.heroLogo} />

        <p className={styles.heroSubtitle}>
          Somos o seu aplicativo de gerenciamento financeiro compartilhado
        </p>

        <div className={styles.heroActions}>
          <button className={styles.btnComece} onClick={() => navigate('/cadastro')}>
            Comece agora
          </button>
        </div>
      </div>

      <section id="quem-somos" className={styles.section}>
        <div className={`${styles.sectionShell} ${styles.reveal}`} data-reveal>
          <h2>Quem somos</h2>
          <p className={styles.sectionIntro}>
            O Adapte nasceu para simplificar a forma como você organiza as finanças em grupo,
            trazendo clareza e previsibilidade para cada decisão.
          </p>
          <div className={styles.valueGrid}>
            {quemSomosCards.map((card, index) => (
              <article
                key={card.title}
                className={`${styles.valueCard} ${styles.reveal}`}
                data-reveal
                style={{ '--reveal-delay': `${(index + 1) * 0.08}s` }}
              >
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className={styles.section}>
        <div className={`${styles.sectionShell} ${styles.reveal}`} data-reveal>
          <h2>Como funciona</h2>
          <p className={styles.sectionIntro}>
            Em três passos, você organiza o presente e planeja o futuro sem fricção.
          </p>

          <div className={styles.stepsGrid}>
            {comoFuncionaPassos.map((step, index) => (
              <article
                key={step.title}
                className={`${styles.stepCard} ${styles.reveal}`}
                data-reveal
                style={{ '--reveal-delay': `${(index + 1) * 0.1}s` }}
              >
                <span className={styles.stepBadge}>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
