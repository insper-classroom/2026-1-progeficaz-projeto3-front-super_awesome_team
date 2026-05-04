import { useMemo, useState } from 'react'
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
import { FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import { usePessoal } from '../../hooks/usePessoal'
import styles from './Pessoal.module.css'

const coresCategorias = ['#047857', '#2563eb', '#d97706', '#7c3aed', '#dc2626', '#0891b2']

function hojeInput() {
  return new Date().toISOString().slice(0, 10)
}

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

function estadoFinanceiro(resumo) {
  if (!resumo.totalAportes && !resumo.totalDespesas) {
    return {
      titulo: 'Sem movimentações',
      texto: 'Registre despesas pessoais ou faça aportes em metas para acompanhar sua evolução.',
      classe: styles.neutro,
    }
  }

  if (resumo.totalAportes >= resumo.totalDespesas) {
    return {
      titulo: 'Aportes acima das despesas',
      texto: `${formatarMoeda(resumo.saldo)} de diferença positiva entre aportes e despesas pessoais.`,
      classe: styles.positivo,
    }
  }

  return {
    titulo: 'Despesas acima dos aportes',
    texto: `${formatarMoeda(Math.abs(resumo.saldo))} a mais em despesas pessoais do que em aportes.`,
    classe: styles.negativo,
  }
}

export function Pessoal() {
  const { data, loading, error, recarregar, criarDespesa, deletarDespesa } = usePessoal()
  const [form, setForm] = useState({
    categoria: '',
    valor: '',
    data: hojeInput(),
  })
  const [salvando, setSalvando] = useState(false)
  const [despesaExcluindoId, setDespesaExcluindoId] = useState(null)
  const [erroFormulario, setErroFormulario] = useState('')

  const resumo = data.resumo
  const feedback = useMemo(() => estadoFinanceiro(resumo), [resumo])
  const categorias = useMemo(
    () => data.graficos.categorias.map((item, index) => ({
      ...item,
      cor: coresCategorias[index % coresCategorias.length],
    })),
    [data.graficos.categorias],
  )
  const fluxoMensal = data.graficos.fluxoMensal
  const despesasRecentes = data.despesas.slice(0, 6)
  const aportesRecentes = data.aportes.slice(0, 6)
  const formularioValido = form.categoria.trim() && Number(form.valor) > 0 && form.data

  function atualizarCampo(event) {
    const { name, value } = event.target
    setForm((atual) => ({ ...atual, [name]: value }))
  }

  async function salvarDespesa(event) {
    event.preventDefault()
    if (!formularioValido) return

    setSalvando(true)
    setErroFormulario('')
    try {
      await criarDespesa({
        categoria: form.categoria.trim(),
        valor: form.valor,
        data: form.data,
      })
      setForm({ categoria: '', valor: '', data: hojeInput() })
    } catch (erro) {
      setErroFormulario(
        erro.response?.data?.error || 'Não foi possível salvar a despesa pessoal.',
      )
    } finally {
      setSalvando(false)
    }
  }

  async function excluirDespesa(despesaId) {
    setDespesaExcluindoId(despesaId)
    try {
      await deletarDespesa(despesaId)
    } finally {
      setDespesaExcluindoId(null)
    }
  }

  if (loading) return <div className={styles.carregando}>Carregando...</div>
  if (error) return <div className={styles.carregando}>Não foi possível carregar os dados pessoais.</div>

  return (
    <div className={styles.pagina}>
      <header className={styles.header}>
        <div>
          <h1>Pessoal</h1>
          <span>Despesas pessoais e seus aportes em metas de grupo</span>
        </div>
        <button type="button" className={styles.botaoSecundario} onClick={recarregar}>
          <FiRefreshCw aria-hidden="true" />
          Atualizar
        </button>
      </header>

      <section className={styles.resumoGrid}>
        <article className={styles.cardResumo}>
          <span>Despesas pessoais</span>
          <strong>{formatarMoeda(resumo.totalDespesas)}</strong>
          <small>{resumo.totalRegistrosDespesa} registros</small>
        </article>
        <article className={styles.cardResumo}>
          <span>Aportes em metas</span>
          <strong>{formatarMoeda(resumo.totalAportes)}</strong>
          <small>{resumo.totalRegistrosAporte} registros</small>
        </article>
        <article className={styles.cardResumo}>
          <span>Saldo</span>
          <strong className={resumo.saldo >= 0 ? styles.valorPositivo : styles.valorNegativo}>
            {formatarMoeda(resumo.saldo)}
          </strong>
          <small>Aportes menos despesas</small>
        </article>
        <article className={`${styles.cardResumo} ${feedback.classe}`}>
          <span>{feedback.titulo}</span>
          <p>{feedback.texto}</p>
        </article>
      </section>

      <section className={styles.gridPrincipal}>
        <form className={styles.formDespesa} onSubmit={salvarDespesa}>
          <div className={styles.cabecalhoSecao}>
            <span>Nova despesa pessoal</span>
          </div>

          <label>
            Categoria
            <input
              name="categoria"
              value={form.categoria}
              onChange={atualizarCampo}
              placeholder="Alimentação"
            />
          </label>

          <div className={styles.linhaCampos}>
            <label>
              Valor
              <input
                name="valor"
                type="number"
                min="0.01"
                step="0.01"
                value={form.valor}
                onChange={atualizarCampo}
                placeholder="0,00"
              />
            </label>
            <label>
              Data
              <input
                name="data"
                type="date"
                value={form.data}
                onChange={atualizarCampo}
              />
            </label>
          </div>

          {erroFormulario && <div className={styles.erro}>{erroFormulario}</div>}

          <button
            type="submit"
            className={styles.botaoPrimario}
            disabled={!formularioValido || salvando}
          >
            <FiPlus aria-hidden="true" />
            {salvando ? 'Salvando...' : 'Adicionar despesa'}
          </button>
        </form>

        <article className={styles.painel}>
          <div className={styles.cabecalhoSecao}>
            <span>Fluxo mensal</span>
          </div>
          {fluxoMensal.length ? (
            <ResponsiveContainer width="100%" height={270}>
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
                <Bar name="Despesas" dataKey="expenses" fill="#dc2626" radius={[6, 6, 0, 0]} />
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
            <span>Despesas por categoria</span>
          </div>
          {categorias.length ? (
            <div className={styles.pizzaLayout}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categorias}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={86}
                    paddingAngle={2}
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
            <div className={styles.vazio}>Sem despesas por categoria.</div>
          )}
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

      <section className={styles.historicoGrid}>
        <article className={styles.painel}>
          <div className={styles.cabecalhoSecao}>
            <span>Despesas recentes</span>
          </div>
          {despesasRecentes.length ? (
            <div className={styles.listaMovimentos}>
              {despesasRecentes.map((despesa) => (
                <div key={despesa.id} className={styles.movimento}>
                  <div>
                    <strong>{despesa.categoria}</strong>
                    <span>{formatarData(despesa.data)}</span>
                  </div>
                  <div className={styles.movimentoValor}>
                    <strong>{formatarMoeda(despesa.valor)}</strong>
                    <button
                      type="button"
                      className={styles.botaoIcone}
                      onClick={() => excluirDespesa(despesa.id)}
                      disabled={despesaExcluindoId === despesa.id}
                      aria-label={`Excluir despesa ${despesa.categoria}`}
                    >
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.vazio}>Nenhuma despesa pessoal.</div>
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
    </div>
  )
}
