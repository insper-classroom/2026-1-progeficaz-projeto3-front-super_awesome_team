// Cards de resumo financeiro: gastos do grupo, variação e saldo a pagar.
// voceDeVe é fixo (dívida do mês atual) — não muda com o filtro de período.
import styles from './CardsResumo.module.css'

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

// Subtítulo do card de gastos conforme o período selecionado
const subtituloPorPeriodo = {
  '7d':  'últimos 7 dias',
  '30d': 'este mês',
  '3m':  'últimos 3 meses',
  '6m':  'últimos 6 meses',
  '1a':  'este ano',
}

export default function CardsResumo({ totalAtual, totalAnterior, voceDeVe, periodo }) {
  // Calcula variação percentual em relação ao período anterior
  const variacaoPct = Math.round(((totalAtual - totalAnterior) / totalAnterior) * 100)

  // Negativo = gastou menos que antes (bom), positivo = gastou mais (ruim)
  const gastouMenos = variacaoPct < 0

  // Classe de cor e sinal calculados antes do JSX
  let classeVariacao = styles.positivo
  let sinal = ''
  if (!gastouMenos) {
    classeVariacao = styles.negativo
    sinal = '+'
  }

  return (
    <div className={styles.container}>

      {/* Card 1: total gasto no período (muda com o filtro) */}
      <div className={styles.card}>
        <span className={styles.rotulo}>Gastos do grupo</span>
        <span className={styles.valor}>{formatarMoeda(totalAtual)}</span>
        <span className={styles.detalhe}>{subtituloPorPeriodo[periodo]}</span>
      </div>

      {/* Card 2: variação em relação ao período anterior */}
      <div className={styles.card}>
        <span className={styles.rotulo}>Variação</span>
        <span className={`${styles.valor} ${classeVariacao}`}>
          {sinal}{variacaoPct}%
        </span>
        <span className={styles.detalhe}>vs período anterior</span>
      </div>

      {/* Card 3: saldo fixo do mês atual — não muda com o filtro de período */}
      <div className={styles.card}>
        <span className={styles.rotulo}>Você deve</span>
        <span className={`${styles.valor} ${styles.negativo}`}>{formatarMoeda(voceDeVe)}</span>
        <span className={styles.detalhe}>ao grupo este mês</span>
      </div>

    </div>
  )
}
