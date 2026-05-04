// Gráfico de linha com evolução dos gastos: período atual vs anterior.
// Recebe evolucao, totalAtual, totalAnterior e periodo para montar o cabeçalho.
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { calcularVariacaoPercentual } from '../../utils/variacaoFinanceira'
import styles from './GraficoGastos.module.css'

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

// Textos do cabeçalho conforme o período selecionado
const textoPorPeriodo = {
  '7d':  { atual: 'esta semana',    anterior: 'semana anterior'    },
  '30d': { atual: 'este mês',       anterior: 'mês anterior'       },
  '3m':  { atual: 'no trimestre',   anterior: 'trimestre anterior' },
  '6m':  { atual: 'no semestre',    anterior: 'semestre anterior'  },
  '1a':  { atual: 'este ano',       anterior: 'ano anterior'       },
}

// Transforma os arrays de evolução em objetos que o Recharts entende
function prepararDados(evolucao) {
  return evolucao.curr.map((valor, i) => ({
    idx: i,
    atual: valor,
    anterior: evolucao.prev[i],
  }))
}

// Calcula em quais índices os labels devem aparecer no eixo X.
// Ex: 30 pontos com 4 labels → ticks em [0, 9, 19, 29]
function calcularTicks(totalPontos, totalLabels) {
  if (totalPontos === totalLabels) {
    return Array.from({ length: totalPontos }, (_, i) => i)
  }
  return Array.from({ length: totalLabels }, (_, i) =>
    Math.round((i / (totalLabels - 1)) * (totalPontos - 1))
  )
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// Retorna o nome legível da série para o tooltip
function nomeDaSerie(chave) {
  if (chave === 'atual') return 'Atual'
  return 'Anterior'
}

export default function GraficoGastos({ evolucao, totalAtual, totalAnterior, periodo }) {
  if (!evolucao) return null

  const dados = prepararDados(evolucao)
  const ticks = calcularTicks(evolucao.curr.length, evolucao.labels.length)
  // ?? significa: se o período não existir no mapa, usa '30d' como padrão
  const textos = textoPorPeriodo[periodo] ?? textoPorPeriodo['30d']

  const variacaoPct = calcularVariacaoPercentual(totalAtual, totalAnterior)
  const temComparacao = variacaoPct !== null
  const gastouMenos = temComparacao && variacaoPct < 0

  // Classe e sinal do badge calculados antes do JSX
  let classeBadge = styles.badgeNeutro
  let textoBadge = 'Sem histórico'
  let descricaoVariacao = `sem dados do ${textos.anterior}`
  if (temComparacao && gastouMenos) {
    classeBadge = styles.badgePositivo
    textoBadge = `${variacaoPct.toFixed(1)}%`
    descricaoVariacao = `vs ${formatarMoeda(totalAnterior)} ${textos.anterior}`
  } else if (temComparacao) {
    classeBadge = styles.badgeNegativo
    textoBadge = `+${variacaoPct.toFixed(1)}%`
    descricaoVariacao = `vs ${formatarMoeda(totalAnterior)} ${textos.anterior}`
  }

  function formatarEixoX(idx) {
    const pos = ticks.indexOf(idx)
    if (pos >= 0) return evolucao.labels[pos]
    return ''
  }

  return (
    <div className={styles.container}>

      {/* Cabeçalho informativo: label, valor total e badge de variação */}
      <div className={styles.cabecalho}>
        <span className={styles.rotulo}>Ritmo de gastos</span>
        <div className={styles.resumo}>
          <span className={styles.valorTotal}>{formatarMoeda(totalAtual)}</span>
          <span className={styles.periodoAtual}>{textos.atual}</span>
        </div>
        <div className={styles.variacao}>
          {/* Badge colorido com a variação percentual */}
          <span className={`${styles.badge} ${classeBadge}`}>
            <span className={styles.badgeDot} />
            {textoBadge}
          </span>
          <span className={styles.variacaoDesc}>
            {descricaoVariacao}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

          <XAxis
            dataKey="idx"
            type="number"
            domain={[0, evolucao.curr.length - 1]}
            ticks={ticks}
            tickFormatter={formatarEixoX}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(v) => `R$${v}`}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />

          <Tooltip
            formatter={(valor, chave) => [formatarMoeda(valor), nomeDaSerie(chave)]}
            labelFormatter={(idx) => formatarEixoX(idx) || `Ponto ${idx + 1}`}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 13,
            }}
          />

          <Line type="monotone" dataKey="atual" stroke="var(--primary)" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="anterior" stroke="var(--text-muted)" strokeWidth={2.2} dot={false} strokeDasharray="6 5" />
        </LineChart>
      </ResponsiveContainer>

      {/* Legenda das linhas */}
      <div className={styles.legenda}>
        <span className={styles.legendaItem}>
          <span className={styles.legendaLinhaAtual} />
          {capitalizar(textos.atual)}
        </span>
        <span className={styles.legendaItem}>
          <span className={styles.legendaLinhaAnterior} />
          {capitalizar(textos.anterior)}
        </span>
      </div>

    </div>
  )
}
