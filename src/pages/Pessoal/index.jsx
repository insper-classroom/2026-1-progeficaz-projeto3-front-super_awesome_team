import { useMemo } from 'react'
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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

function obterData(valor) {
  if (!valor) return null
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return null
  return data
}

function obterChaveDia(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function mesmoMes(dataA, dataB) {
  return dataA.getFullYear() === dataB.getFullYear() && dataA.getMonth() === dataB.getMonth()
}

function obterMesReferenciaVencimentos(vencimentos) {
  const hoje = new Date()
  const datas = vencimentos
    .map((vencimento) => obterData(vencimento.data))
    .filter(Boolean)

  if (!datas.length) return hoje

  const dataNoMesAtual = datas.find((data) => mesmoMes(data, hoje))
  if (dataNoMesAtual) return hoje

  const futuras = datas
    .filter((data) => data >= hoje)
    .sort((a, b) => a.getTime() - b.getTime())
  if (futuras[0]) return futuras[0]

  return datas.sort((a, b) => b.getTime() - a.getTime())[0]
}

function obterStatusDia(itens) {
  if (!itens.length) return 'vazio'

  const pendentes = itens.filter((item) => !item.resolvido)
  if (!pendentes.length) return 'concluido'

  const temPagar = pendentes.some((item) => item.papel === 'debtor')
  const temReceber = pendentes.some((item) => item.papel === 'creditor')

  if (temPagar && temReceber) return 'misto'
  if (temPagar) return 'pagar'
  return 'receber'
}

function calcularNivelIntensidade(valor, maiorValor, status) {
  if (!valor || !maiorValor || status === 'vazio' || status === 'concluido') return 0

  const proporcao = valor / maiorValor
  if (proporcao >= 0.76) return 4
  if (proporcao >= 0.51) return 3
  if (proporcao >= 0.26) return 2
  return 1
}

function obterClasseStatusDia(status, nivel) {
  if (status === 'concluido') return styles.mapaCalorStatusConcluido
  if (status === 'pagar') return styles[`mapaCalorStatusPagar${nivel}`]
  if (status === 'receber') return styles[`mapaCalorStatusReceber${nivel}`]
  if (status === 'misto') return styles[`mapaCalorStatusMisto${nivel}`]
  return styles.mapaCalorStatusVazio
}

function obterTextoStatusItem(item) {
  if (item.resolvido) return 'Concluída'
  return item.papel === 'creditor' ? 'A receber' : 'A pagar'
}

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

function obterCompromissoMaisProximo(vencimentos) {
  const hoje = inicioDoDia(new Date())
  const pendentes = vencimentos
    .map((item) => ({ ...item, dataObj: obterData(item.data) }))
    .filter((item) => item.dataObj && !item.resolvido)

  if (!pendentes.length) {
    return {
      titulo: 'Sem pendências próximas',
      subtitulo: 'Todos os compromissos financeiros estão concluídos.',
    }
  }

  const futuros = pendentes
    .filter((item) => inicioDoDia(item.dataObj) >= hoje)
    .sort((a, b) => a.dataObj.getTime() - b.dataObj.getTime())
  const atrasados = pendentes
    .filter((item) => inicioDoDia(item.dataObj) < hoje)
    .sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime())

  const referencia = futuros[0] || atrasados[0]
  const dataReferencia = inicioDoDia(referencia.dataObj)
  const itensDoDia = pendentes.filter((item) => inicioDoDia(item.dataObj).getTime() === dataReferencia.getTime())
  const totalDia = itensDoDia.reduce((total, item) => total + Number(item.valor || 0), 0)
  const temPagar = itensDoDia.some((item) => item.papel === 'debtor')
  const temReceber = itensDoDia.some((item) => item.papel === 'creditor')

  let titulo = 'Próximos compromissos'
  if (itensDoDia.length === 1) {
    titulo = `${referencia.papel === 'creditor' ? 'Próximo recebimento' : 'Próximo pagamento'}: ${referencia.categoria}`
  } else if (temPagar && !temReceber) {
    titulo = 'Próximos pagamentos'
  } else if (!temPagar && temReceber) {
    titulo = 'Próximos recebimentos'
  }

  const prefixoData = futuros[0] ? 'até' : 'pendente desde'
  return {
    titulo,
    subtitulo: `${prefixoData} ${formatarData(referencia.data)} · ${itensDoDia.length} compromisso${itensDoDia.length > 1 ? 's' : ''} · ${formatarMoeda(totalDia)}`,
  }
}

function montarCalendarioVencimentos(vencimentos) {
  const referencia = obterMesReferenciaVencimentos(vencimentos)
  const ano = referencia.getFullYear()
  const mesIndex = referencia.getMonth()
  const primeiroDia = new Date(ano, mesIndex, 1)
  const diasNoMes = new Date(ano, mesIndex + 1, 0).getDate()
  const vencimentosPorDia = new Map()

  vencimentos.forEach((vencimento) => {
    const data = obterData(vencimento.data)
    if (!data || data.getFullYear() !== ano || data.getMonth() !== mesIndex) return

    const chaveDia = obterChaveDia(data)
    const itens = vencimentosPorDia.get(chaveDia) || []
    itens.push(vencimento)
    vencimentosPorDia.set(chaveDia, itens)
  })

  const totaisPorDia = [...vencimentosPorDia.entries()].map(([dia, itens]) => [
    dia,
    itens.reduce((total, item) => total + Number(item.valor || 0), 0),
  ])
  const valores = totaisPorDia.map(([, valor]) => valor)
  const maiorValor = valores.length ? Math.max(...valores) : 0
  const totalMes = valores.reduce((total, valor) => total + valor, 0)
  const maiorEntrada = totaisPorDia.sort(([, valorA], [, valorB]) => valorB - valorA)[0]
  const celulas = []

  for (let i = 0; i < primeiroDia.getDay(); i += 1) {
    celulas.push({ tipo: 'vazio', id: `vazio-${i}` })
  }

  for (let dia = 1; dia <= diasNoMes; dia += 1) {
    const data = new Date(ano, mesIndex, dia)
    const chaveDia = obterChaveDia(data)
    const itens = vencimentosPorDia.get(chaveDia) || []
    const valor = itens.reduce((total, item) => total + Number(item.valor || 0), 0)
    const status = obterStatusDia(itens)
    const nivel = calcularNivelIntensidade(valor, maiorValor, status)

    celulas.push({
      tipo: 'dia',
      id: chaveDia,
      dia,
      valor,
      itens,
      status,
      nivel,
    })
  }

  return {
    titulo: formatarMes(`${ano}-${String(mesIndex + 1).padStart(2, '0')}`),
    totalMes,
    maiorValor,
    maiorDia: maiorEntrada ? Number(maiorEntrada[0].split('-')[2]) : null,
    diasComVencimento: vencimentosPorDia.size,
    celulas,
  }
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
  const calendarioVencimentos = useMemo(
    () => montarCalendarioVencimentos(data.vencimentos),
    [data.vencimentos],
  )
  const compromissoProximo = useMemo(
    () => obterCompromissoMaisProximo(data.vencimentos),
    [data.vencimentos],
  )

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
          <span>Você deve</span>
          <strong className={styles.valorNegativo}>{formatarMoeda(resumo.totalDespesas)}</strong>
          <small>{resumo.totalRegistrosDespesa} registros em {resumo.totalGrupos} grupos</small>
        </article>
        <article className={styles.cardResumo}>
          <span>Você pagou</span>
          <strong className={styles.valorPositivo}>{formatarMoeda(resumo.totalPago)}</strong>
          <small>Como devedor em confirmação dupla</small>
        </article>
        <article className={styles.cardResumo}>
          <span>Você recebeu</span>
          <strong className={styles.valorRecebido}>{formatarMoeda(resumo.totalRecebido)}</strong>
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
              <LineChart data={fluxoMensal} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                <Line
                  name="Despesas confirmadas"
                  type="monotone"
                  dataKey="expenses"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  name="Aportes"
                  type="monotone"
                  dataKey="contributions"
                  stroke="#047857"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
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
        <article className={styles.mapaCalor}>
          <div className={styles.mapaCalorCabecalho}>
            <div>
              <h3 className={styles.mapaCalorTitle}>{compromissoProximo.titulo}</h3>
              <p>{compromissoProximo.subtitulo}</p>
            </div>
            <span>{calendarioVencimentos.titulo}</span>
          </div>

          <div className={styles.mapaCalorResumo}>
            <div>
              <span>Maior vencimento</span>
              <strong>
                {calendarioVencimentos.maiorDia
                  ? `${String(calendarioVencimentos.maiorDia).padStart(2, '0')} - ${formatarMoeda(calendarioVencimentos.maiorValor)}`
                  : 'Sem vencimentos'}
              </strong>
            </div>
            <div>
              <span>Dias com vencimento</span>
              <strong>{calendarioVencimentos.diasComVencimento}</strong>
            </div>
          </div>

          <div className={styles.mapaCalorSemana}>
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, index) => (
              <span key={`${dia}-${index}`}>{dia}</span>
            ))}
          </div>

          <div className={styles.mapaCalorGrade}>
            {calendarioVencimentos.celulas.map((celula) => {
              if (celula.tipo === 'vazio') {
                return <span key={celula.id} className={styles.mapaCalorVazio} />
              }
              const temVencimento = celula.itens.length > 0

              return (
                <span
                  key={celula.id}
                  className={`${styles.mapaCalorDia} ${obterClasseStatusDia(celula.status, celula.nivel)}`}
                  tabIndex={0}
                  aria-label={`${String(celula.dia).padStart(2, '0')}: ${formatarMoeda(celula.valor)} em vencimentos`}
                >
                  {celula.dia}
                  {temVencimento && (
                    <span className={styles.mapaCalorQuantidade}>{celula.itens.length}</span>
                  )}
                  {temVencimento && (
                    <span className={styles.mapaCalorTooltip}>
                      <strong>Dia {String(celula.dia).padStart(2, '0')}</strong>
                      <span>Total: {formatarMoeda(celula.valor)}</span>
                      {celula.itens.slice(0, 3).map((item) => (
                        <span key={item.id}>
                          {obterTextoStatusItem(item)} · {item.categoria} · {item.nomeGrupo} · {formatarMoeda(item.valor)}
                        </span>
                      ))}
                      {celula.itens.length > 3 && (
                        <span>+{celula.itens.length - 3} vencimentos</span>
                      )}
                    </span>
                  )}
                </span>
              )
            })}
          </div>

          <div className={styles.mapaCalorLegenda}>
            <span><i className={styles.mapaCalorStatusPagar4} /> A pagar</span>
            <span><i className={styles.mapaCalorStatusReceber4} /> A receber</span>
            <span><i className={styles.mapaCalorStatusMisto4} /> Ambos</span>
            <span><i className={styles.mapaCalorStatusConcluido} /> Concluído</span>
          </div>
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
