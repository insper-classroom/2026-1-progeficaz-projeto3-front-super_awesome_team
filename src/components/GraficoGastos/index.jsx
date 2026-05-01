// Gráfico de linha com evolução dos gastos: período atual vs anterior.
// Recebe o objeto `evolucao` do hook useVisaoGeral.
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import styles from './GraficoGastos.module.css'

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
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

export default function GraficoGastos({ evolucao }) {
  if (!evolucao) return null

  const dados = prepararDados(evolucao)
  const ticks = calcularTicks(evolucao.curr.length, evolucao.labels.length)

  // retorna o label correto para cada índice do eixo X
  function formatarEixoX(idx) {
    const pos = ticks.indexOf(idx)
    return pos >= 0 ? evolucao.labels[pos] : ''
  }

  return (
    <div className={styles.container}>
      <div className={styles.cabecalho}>
        <span className={styles.titulo}>Evolução dos gastos</span>
        <div className={styles.legenda}>
          <span className={styles.legendaAtual}>— Atual</span>
          <span className={styles.legendaAnterior}>--- Anterior</span>
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

          {/* Linha do período atual — destaque */}
          <Line type="monotone" dataKey="atual" stroke="var(--primary)" strokeWidth={2} dot={false} />

          {/* Linha do período anterior — tracejada e mais discreta */}
          <Line type="monotone" dataKey="anterior" stroke="var(--text-muted)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
