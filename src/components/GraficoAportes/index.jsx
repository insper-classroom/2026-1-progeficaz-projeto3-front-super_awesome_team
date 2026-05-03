// Gráfico de linha com evolução dos aportes de uma meta ao longo do tempo.
// Recebe evolucao (realizados + ritmo + labels), totalPeriodo, variacao, periodo e onPeriodo.
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import styles from './GraficoAportes.module.css'

const periodos = [
  { valor: '7d', rotulo: '7d' },
  { valor: '1m', rotulo: '1m' },
  { valor: '3m', rotulo: '3m' },
  { valor: '6m', rotulo: '6m' },
]

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

// Transforma os arrays da evolução em objetos que o Recharts entende.
function prepararDados(evolucao) {
  return evolucao.realizados.map((valor, i) => ({
    idx: i,
    realizados: valor,
    ritmo: evolucao.ritmo[i],
  }))
}

// Calcula em quais índices os labels devem aparecer no eixo X.
function calcularTicks(totalPontos, totalLabels) {
  if (totalPontos === totalLabels) {
    return Array.from({ length: totalPontos }, (_, i) => i)
  }
  return Array.from({ length: totalLabels }, (_, i) =>
    Math.round((i / (totalLabels - 1)) * (totalPontos - 1))
  )
}

export default function GraficoAportes({ evolucao, totalPeriodo, variacao, periodo, onPeriodo }) {
  // Exibe estado vazio enquanto não há dados (antes de conectar a API).
  if (!evolucao) {
    return (
      <div className={styles.container}>
        <div className={styles.cabecalho}>
          <div className={styles.ladoEsquerdo}>
            <span className={styles.rotulo}>Evolução dos aportes</span>
          </div>
          <div className={styles.filtroPeriodo}>
            {periodos.map((p) => {
              let classeBotao = styles.btnPeriodo
              if (p.valor === periodo) {
                classeBotao = `${styles.btnPeriodo} ${styles.btnPeriodoAtivo}`
              }
              return (
                <button key={p.valor} type="button" className={classeBotao} onClick={() => onPeriodo(p.valor)}>
                  {p.rotulo}
                </button>
              )
            })}
          </div>
        </div>
        <div className={styles.vazio}>Sem dados de aportes para este período.</div>
      </div>
    )
  }

  const dados = prepararDados(evolucao)
  const ticks = calcularTicks(evolucao.realizados.length, evolucao.labels.length)

  // Classe e sinal do badge de variação calculados antes do JSX.
  let classeBadge = styles.badgePositivo
  let sinalVariacao = '+'
  if (variacao < 0) {
    classeBadge = styles.badgeNegativo
    sinalVariacao = ''
  }

  function formatarEixoX(idx) {
    const pos = ticks.indexOf(idx)
    if (pos >= 0) return evolucao.labels[pos]
    return ''
  }

  function classeBotaoPeriodo(valor) {
    if (valor === periodo) return `${styles.btnPeriodo} ${styles.btnPeriodoAtivo}`
    return styles.btnPeriodo
  }

  return (
    <div className={styles.container}>

      {/* Cabeçalho: label + total + badge de variação + filtro de período */}
      <div className={styles.cabecalho}>
        <div className={styles.ladoEsquerdo}>
          <span className={styles.rotulo}>Evolução dos aportes</span>
          <span className={styles.valorTotal}>{formatarMoeda(totalPeriodo)}</span>
          <span className={styles.subRotulo}>guardados no período</span>
        </div>
        <div className={styles.ladoDireito}>
          <div className={styles.filtroPeriodo}>
            {periodos.map((p) => (
              <button key={p.valor} type="button" className={classeBotaoPeriodo(p.valor)} onClick={() => onPeriodo(p.valor)}>
                {p.rotulo}
              </button>
            ))}
          </div>
          <span className={`${styles.badge} ${classeBadge}`}>
            <span className={styles.badgeDot} />
            {sinalVariacao}{variacao?.toFixed(1)}% vs período anterior
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

          <XAxis
            dataKey="idx"
            type="number"
            domain={[0, evolucao.realizados.length - 1]}
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
            formatter={(valor, chave) => [
              formatarMoeda(valor),
              chave === 'realizados' ? 'Aportes realizados' : 'Ritmo necessário',
            ]}
            labelFormatter={(idx) => formatarEixoX(idx) || `Ponto ${idx + 1}`}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 13,
            }}
          />

          <Line type="monotone" dataKey="realizados" stroke="var(--primary)" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="ritmo" stroke="var(--text-muted)" strokeWidth={2} dot={false} strokeDasharray="6 5" />
        </LineChart>
      </ResponsiveContainer>

      {/* Legenda das linhas */}
      <div className={styles.legenda}>
        <span className={styles.legendaItem}>
          <span className={styles.legendaLinhaAtual} />
          Aportes realizados
        </span>
        <span className={styles.legendaItem}>
          <span className={styles.legendaLinhaAlvo} />
          Ritmo necessário
        </span>
      </div>

    </div>
  )
}
