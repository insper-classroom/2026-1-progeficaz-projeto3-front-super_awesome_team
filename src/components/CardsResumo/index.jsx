// Cards de resumo financeiro do período: total gasto, variação e saldo a pagar.
// Recebe os dados prontos via props — a lógica de busca fica em VisaoGeral.
import styles from './CardsResumo.module.css'

// Formata número como moeda brasileira (ex: 1860 → "R$ 1.860")
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

export default function CardsResumo({ totalAtual, totalAnterior, voceDeVe }) {
  // Calcula variação percentual em relação ao período anterior
  const variacaoPct = Math.round(((totalAtual - totalAnterior) / totalAnterior) * 100)

  // Negativo = gastou menos que antes (bom), positivo = gastou mais (ruim)
  const gastouMenos = variacaoPct < 0

  return (
    <div className={styles.container}>

      {/* Card 1: total gasto no período */}
      <div className={styles.card}>
        <span className={styles.rotulo}>Total gasto</span>
        <span className={styles.valor}>{formatarMoeda(totalAtual)}</span>
        <span className={styles.detalhe}>no período</span>
      </div>

      {/* Card 2: variação em relação ao período anterior */}
      <div className={styles.card}>
        <span className={styles.rotulo}>Variação</span>
        <span className={`${styles.valor} ${gastouMenos ? styles.positivo : styles.negativo}`}>
          {gastouMenos ? '' : '+'}{variacaoPct}%
        </span>
        <span className={styles.detalhe}>vs período anterior</span>
      </div>

      {/* Card 3: quanto o usuário deve aos outros membros */}
      <div className={styles.card}>
        <span className={styles.rotulo}>Você deve</span>
        <span className={`${styles.valor} ${styles.negativo}`}>{formatarMoeda(voceDeVe)}</span>
        <span className={styles.detalhe}>aos membros</span>
      </div>

    </div>
  )
}
