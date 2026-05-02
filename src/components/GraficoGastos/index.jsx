// Gráfico de linha com evolução dos gastos: período atual vs anterior.
// Recebe evolucao, totalAtual, totalAnterior e periodo para montar o cabeçalho.
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
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

// Transforma os arrays do mock em objetos que o Recharts entende
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

export default function GraficoGastos({ evolucao, totalAtual, totalAnterior, periodo }) {
  if (!evolucao) return null

  const dados = prepararDados(evolucao)
  const ticks = calcularTicks(evolucao.curr.length, evolucao.labels.length)
  const textos = textoPorPeriodo[periodo] ?? textoPorPeriodo['30d']

  const variacaoPct = ((totalAtual - totalAnterior) / totalAnterior) * 100
  const gastouMenos = variacaoPct < 0

  function formatarEixoX(idx) {
    const pos = ticks.indexOf(idx)
    return pos >= 0 ? evolucao.labels[pos] : ''
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
          <span className={`${styles.badge} ${gastouMenos ? styles.badgePositivo : styles.badgeNegativo}`}>
            <span className={styles.badgeDot} />
            {gastouMenos ? '' : '+'}{variacaoPct.toFixed(1)}%
          </span>
          <span className={styles.variacaoDesc}>
            vs {formatarMoeda(totalAnterior)} {textos.anterior}
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
            formatter={(valor, chave) => [formatarMoeda(valor), chave === 'atual' ? 'Atual' : 'Anterior']}
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
