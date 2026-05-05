import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FiRefreshCw } from 'react-icons/fi'
import { usePessoal } from '../../hooks/usePessoal'
import styles from './Pessoal.module.css'

const coresCategorias = ['#047857', '#2563eb', '#d97706', '#7c3aed', '#dc2626', '#0891b2']

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatarData(valor) {
  if (!valor) return 'Sem data'
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return 'Sem data'
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatarMes(valor) {
  if (!valor || valor === 'Sem data') return 'Sem data'
  const data = new Date(`${valor}-01T12:00:00Z`)
  if (Number.isNaN(data.getTime())) return valor
  return data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

function TooltipMoeda({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className={styles.tooltip}>
      <strong>{formatarMes(label)}</strong>
      {payload.map((item) => (
        <span key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {formatarMoeda(item.value)}
        </span>
      ))}
    </div>
  )
}

function TooltipCategoria({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload

  return (
    <div className={styles.tooltip}>
      <strong>{item.name}</strong>
      <span>{formatarMoeda(item.value)}</span>
      <span>{item.percentage}%</span>
    </div>
  )
}

function textoFeedback(resumo) {
  if (!resumo.totalRegistrosDespesa && !resumo.totalRegistrosAporte) {
    return 'Sem movimentações confirmadas nos grupos ainda.'
  }

  if (resumo.totalPago > resumo.totalRecebido) {
    return `${formatarMoeda(resumo.totalPago)} pagos em despesas confirmadas nos grupos.`
  }

  if (resumo.totalRecebido > resumo.totalPago) {
    return `${formatarMoeda(resumo.totalRecebido)} recebidos em despesas confirmadas nos grupos.`
  }

  return 'Pagamentos e recebimentos confirmados estão no mesmo nível.'
}

export function Pessoal() {
  const { data, loading, error, recarregar } = usePessoal()

  const resumo = data.resumo
  const categorias = useMemo(
    () => data.graficos.categorias.map((item, index) => ({
      ...item,
      cor: coresCategorias[index % coresCategorias.length],
    })),
    [data.graficos.categorias],
  )
  const fluxoMensal = data.graficos.fluxoMensal
  const despesasRecentes = data.despesas.slice(0, 8)
  const aportesRecentes = data.aportes.slice(0, 6)

  if (loading) return <div className={styles.carregando}>Carregando...</div>
  if (error) return <div className={styles.carregando}>Não foi possível carregar os dados pessoais.</div>

  return (
    <div className={styles.pagina}>
      <header className={styles.header}>
        <div>
          <h1>Pessoal</h1>
          <span>Feedback visual consolidado das suas movimentações nos grupos</span>
        </div>
        <button type="button" className={styles.botaoSecundario} onClick={recarregar}>
          <FiRefreshCw aria-hidden="true" />
          Atualizar
        </button>
      </header>

      <section className={styles.resumoGrid}>
        <article className={styles.cardResumo}>
          <span>Despesas confirmadas</span>
          <strong>{formatarMoeda(resumo.totalDespesas)}</strong>
          <small>{resumo.totalRegistrosDespesa} registros em {resumo.totalGrupos} grupos</small>
        </article>
        <article className={styles.cardResumo}>
          <span>Você pagou</span>
          <strong>{formatarMoeda(resumo.totalPago)}</strong>
          <small>Como devedor em confirmação dupla</small>
        </article>
        <article className={styles.cardResumo}>
          <span>Você recebeu</span>
          <strong>{formatarMoeda(resumo.totalRecebido)}</strong>
          <small>Como credor em confirmação dupla</small>
        </article>
        <article className={styles.cardResumo}>
          <span>Aportes em metas</span>
          <strong>{formatarMoeda(resumo.totalAportes)}</strong>
          <small>{resumo.totalRegistrosAporte} registros em metas de grupo</small>
        </article>
      </section>

      <section className={styles.gridPrincipal}>
        <article className={styles.painel}>
          <div className={styles.cabecalhoSecao}>
            <span>Despesas por categoria</span>
          </div>
          {categorias.length ? (
            <div className={styles.pizzaLayout}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categorias}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {categorias.map((item) => (
                      <Cell key={item.name} fill={item.cor} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipCategoria />} />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.legendaCategorias}>
                {categorias.map((item) => (
                  <div key={item.name} className={styles.linhaLegenda}>
                    <span className={styles.ponto} style={{ background: item.cor }} />
                    <span>{item.name}</span>
                    <strong>{formatarMoeda(item.value)}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.vazio}>Sem despesas confirmadas por categoria.</div>
          )}
        </article>

        <article className={styles.painel}>
          <div className={styles.cabecalhoSecao}>
            <span>Fluxo mensal</span>
          </div>
          {fluxoMensal.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fluxoMensal} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatarMes}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(valor) => `R$${valor}`}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip content={<TooltipMoeda />} />
                <Bar name="Despesas confirmadas" dataKey="expenses" fill="#dc2626" radius={[6, 6, 0, 0]} />
                <Bar name="Aportes" dataKey="contributions" fill="#047857" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.vazio}>Sem dados mensais.</div>
          )}
        </article>
      </section>

      <section className={styles.analiseGrid}>
        <article className={styles.painel}>
          <div className={styles.cabecalhoSecao}>
            <span>Despesas recentes dos grupos</span>
          </div>
          {despesasRecentes.length ? (
            <div className={styles.listaMovimentos}>
              {despesasRecentes.map((despesa) => (
                <div key={despesa.id} className={styles.movimento}>
                  <div>
                    <strong>{despesa.categoria}</strong>
                    <span>{despesa.nomeGrupo} · {despesa.papelTexto} · {formatarData(despesa.data)}</span>
                  </div>
                  <div className={styles.movimentoValor}>
                    <strong className={despesa.papel === 'creditor' ? styles.valorPositivo : styles.valorNegativo}>
                      {formatarMoeda(despesa.valor)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.vazio}>Nenhuma despesa de grupo concluída.</div>
          )}
        </article>

        <article className={styles.painel}>
          <div className={styles.cabecalhoSecao}>
            <span>Aportes recentes</span>
          </div>
          {aportesRecentes.length ? (
            <div className={styles.listaMovimentos}>
              {aportesRecentes.map((aporte) => (
                <div key={aporte.id} className={styles.movimento}>
                  <div>
                    <strong>{aporte.nomeMeta}</strong>
                    <span>{aporte.nomeGrupo} · {formatarData(aporte.data)}</span>
                  </div>
                  <div className={styles.movimentoValor}>
                    <strong className={styles.valorPositivo}>{formatarMoeda(aporte.valor)}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.vazio}>Nenhum aporte em metas de grupo.</div>
          )}
        </article>
      </section>

      <section className={styles.analiseGrid}>
        <article className={styles.painelDestaque}>
          <span>Leitura geral</span>
          <p>{textoFeedback(resumo)}</p>
        </article>

        <article className={styles.painel}>
          <div className={styles.cabecalhoSecao}>
            <span>Aportes por meta</span>
          </div>
          {data.graficos.aportesPorMeta.length ? (
            <div className={styles.listaRanking}>
              {data.graficos.aportesPorMeta.map((item, index) => {
                const maiorValor = data.graficos.aportesPorMeta[0]?.value || 1
                const largura = Math.max((item.value / maiorValor) * 100, 6)

                return (
                  <div key={item.goal_id} className={styles.itemRanking}>
                    <div className={styles.itemRankingTopo}>
                      <span>{item.goal_name}</span>
                      <strong>{formatarMoeda(item.value)}</strong>
                    </div>
                    <div className={styles.barraRanking}>
                      <span style={{ width: `${largura}%` }} />
                    </div>
                    <small>#{index + 1}</small>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={styles.vazio}>Sem aportes registrados.</div>
          )}
        </article>
      </section>
    </div>
  )
}
