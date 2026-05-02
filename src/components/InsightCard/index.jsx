// InsightCard — análise automática do período gerada por regras simples, sem IA.
// Compara totalAtual com totalAnterior e escolhe a frase/descrição adequada.
import styles from './InsightCard.module.css'

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

// Label do total exibido conforme o período selecionado
const labelPorPeriodo = {
  '7d':  'Gastos na semana',
  '30d': 'Gastos no mês',
  '3m':  'Total no trimestre',
  '6m':  'Total no semestre',
  '1a':  'Total no ano',
}

// Gera frase e lista de tópicos com base na variação percentual
function gerarTextoInsight(variacaoPct, maiorCategoria) {
  const abs = Math.abs(variacaoPct).toFixed(1)

  if (variacaoPct <= -15) return {
    frase: 'Ótimo! Vocês reduziram bastante os gastos.',
    topicos: [
      `Queda de ${abs}% em relação ao período anterior.`,
      `${maiorCategoria} continua sendo o maior gasto — mas o ritmo está excelente.`,
    ],
  }
  if (variacaoPct < -5) return {
    frase: 'Vocês gastaram menos este período.',
    topicos: [
      `Redução de ${abs}% em relação ao período anterior.`,
      `O maior gasto foi em ${maiorCategoria} — atenção para manter o ritmo.`,
    ],
  }
  if (variacaoPct <= 5) return {
    frase: 'Gastos estáveis em relação ao período anterior.',
    topicos: [
      `Variação de apenas ${abs}% em relação ao período anterior.`,
      `${maiorCategoria} segue como principal categoria de gasto.`,
    ],
  }
  if (variacaoPct <= 15) return {
    frase: 'Gastos aumentaram um pouco este período.',
    topicos: [
      `Alta de ${abs}% em relação ao período anterior.`,
      `Fique de olho em ${maiorCategoria}, que liderou os gastos.`,
    ],
  }
  return {
    frase: 'Atenção: os gastos cresceram bastante.',
    topicos: [
      `Aumento de ${abs}% em relação ao período anterior.`,
      `O maior impacto foi em ${maiorCategoria} — vale revisar os gastos.`,
    ],
  }
}

export default function InsightCard({ totalAtual, totalAnterior, categorias, periodo }) {
  // Calcula variação percentual: negativo = gastou menos (bom)
  const variacaoPct = ((totalAtual - totalAnterior) / totalAnterior) * 100
  const gastouMenos = variacaoPct < 0

  // Maior categoria já vem ordenada por valor no mock/API
  const maiorCategoria = categorias?.[0]

  const { frase, topicos } = gerarTextoInsight(variacaoPct, maiorCategoria?.nome ?? '')

  // Classe de cor e seta da variação calculados antes do JSX
  let classeVariacao = styles.positivo
  let seta = '↓'
  if (!gastouMenos) {
    classeVariacao = styles.negativo
    seta = '↑'
  }

  return (
    <div className={styles.card}>
      <div>
        <div className={styles.frase}>{frase}</div>

        {/* Tópicos em lista */}
        <ul className={styles.topicos}>
          {topicos.map((topico, i) => (
            <li key={i}>{topico}</li>
          ))}
        </ul>
      </div>

      {/* Mini-grid ancorado na base do card */}
      <div className={styles.miniGrid}>

        <div className={styles.mini}>
          <div className={styles.miniLabel}>{labelPorPeriodo[periodo]}</div>
          <div className={styles.miniValor}>{formatarMoeda(totalAtual)}</div>
        </div>

        <div className={styles.mini}>
          <div className={styles.miniLabel}>Vs. período anterior</div>
          <div className={`${styles.miniValor} ${classeVariacao}`}>
            {seta} {Math.abs(variacaoPct).toFixed(1)}%
          </div>
        </div>

        <div className={styles.mini}>
          <div className={styles.miniLabel}>Maior categoria</div>
          <div className={styles.miniValor}>
            {/* Bolinha colorida representando a categoria */}
            {maiorCategoria && (
              <span className={styles.ponto} style={{ background: maiorCategoria.cor }} />
            )}
            {maiorCategoria?.nome}
          </div>
        </div>

      </div>
    </div>
  )
}
