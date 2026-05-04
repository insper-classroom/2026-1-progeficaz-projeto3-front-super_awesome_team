import { useCallback, useEffect, useState } from 'react'
import {
  atualizarMetaGrupo,
  criarMetaGrupo,
  listarMetasDoGrupo,
  registrarAporteMeta,
} from '../services/goalService'
import { buscarGrupo } from '../services/groupService'

const coresMembros = ['#ff2d87', '#7c2fff', '#ff9f00', '#03fc83', '#2d9cff']

const dadosMetasVazios = {
  membros: [],
  metas: [],
  movimentacoes: [],
}

function numeroSeguro(valor) {
  const numero = Number(valor)
  if (Number.isFinite(numero)) return numero
  return 0
}

function nomeDoEmail(email) {
  if (!email) return 'Membro'
  return email.split('@')[0]
}

function iniciaisDoNome(nome) {
  return nome.slice(0, 2).toUpperCase()
}

function normalizarMembro(email, index) {
  const nome = nomeDoEmail(email)

  return {
    id: email,
    email,
    nome,
    iniciais: iniciaisDoNome(nome),
    cor: coresMembros[index % coresMembros.length],
    foto: null,
  }
}

function converterData(data) {
  if (!data) return null

  const dataConvertida = new Date(data)
  if (Number.isNaN(dataConvertida.getTime())) return null

  return dataConvertida
}

function obterPrazoData(dueDate) {
  const data = converterData(dueDate)
  if (!data) return ''

  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
}

function obterPrazoTexto(prazoData) {
  if (!prazoData) return 'Sem prazo'

  const [ano, mes] = prazoData.split('-').map(Number)
  if (!ano || !mes) return 'Sem prazo'

  return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
  })
}

function calcularSituacao(meta) {
  if (!meta.total) return 'atencao'

  const percentual = (meta.alcancado / meta.total) * 100
  if (percentual >= 80) return 'noRitmo'
  if (percentual >= 50) return 'saudavel'
  return 'atencao'
}

function calcularAporteIdeal(meta) {
  if (!meta.prazoData || meta.alcancado >= meta.total) return 0

  const [anoPrazo, mesPrazo] = meta.prazoData.split('-').map(Number)
  if (!anoPrazo || !mesPrazo) return 0

  const hoje = new Date()
  const meses = (anoPrazo - hoje.getFullYear()) * 12 + (mesPrazo - hoje.getMonth())
  const mesesRestantes = Math.max(1, meses)

  return Math.ceil((meta.total - meta.alcancado) / mesesRestantes)
}

function montarProximoAporte(meta) {
  const aporteIdeal = calcularAporteIdeal(meta)
  const membrosIds = meta.membrosIds || []
  const valorPorMembro = membrosIds.length ? Math.ceil(aporteIdeal / membrosIds.length) : 0

  return {
    valorTotal: aporteIdeal,
    porMembro: membrosIds.map((membroId) => ({
      membroId,
      valor: valorPorMembro,
    })),
  }
}

function montarEvolucaoAportes(goal) {
  const contributions = goal.contributions || []
  const total = contributions.reduce((soma, aporte) => soma + numeroSeguro(aporte.value), 0)

  return {
    '7d': { realizados: [0, 0, 0, 0, 0, 0, total], ritmo: [0, 0, 0, 0, 0, 0, 0], labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] },
    '1m': { realizados: [0, 0, 0, total], ritmo: [0, 0, 0, 0], labels: ['1', '10', '20', '30'] },
    '3m': { realizados: [0, 0, total], ritmo: [0, 0, 0], labels: ['M-2', 'M-1', 'Atual'] },
    '6m': { realizados: [0, 0, 0, 0, 0, total], ritmo: [0, 0, 0, 0, 0, 0], labels: ['M-5', 'M-4', 'M-3', 'M-2', 'M-1', 'Atual'] },
  }
}

function montarEstatisticasAportes(goal) {
  const total = (goal.contributions || []).reduce(
    (soma, aporte) => soma + numeroSeguro(aporte.value),
    0,
  )

  return {
    '7d': { total, variacao: null },
    '1m': { total, variacao: null },
    '3m': { total, variacao: null },
    '6m': { total, variacao: null },
  }
}

function normalizarMeta(goal) {
  const prazoData = obterPrazoData(goal.due_date)
  const meta = {
    id: goal._id,
    nome: goal.name,
    icone: goal.icon,
    prazo: obterPrazoTexto(prazoData),
    prazoData,
    alcancado: numeroSeguro(goal.current_value),
    total: numeroSeguro(goal.target_value),
    tipo: 'grupo',
    membrosIds: goal.members || [],
    descricao: goal.description,
    raw: goal,
  }

  meta.situacao = calcularSituacao(meta)
  meta.aporteIdeal = calcularAporteIdeal(meta)
  meta.proximoAporte = montarProximoAporte(meta)
  meta.evolucaoAportes = montarEvolucaoAportes(goal)
  meta.estatisticasAportes = montarEstatisticasAportes(goal)

  return meta
}

function normalizarMovimentacao(aporte, meta) {
  const data = converterData(aporte.contributed_at)
  const dataTexto = data
    ? data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : 'sem data'
  const membroId = aporte.member_email

  return {
    id: `${meta.id}-${membroId}-${aporte.contributed_at}-${aporte.value}`,
    membroId,
    nomeMembro: nomeDoEmail(membroId),
    metaId: meta.id,
    nomeMeta: meta.nome,
    tipo: 'aporte',
    valor: numeroSeguro(aporte.value),
    data: dataTexto,
  }
}

export function normalizarDadosMetas(grupo, goals) {
  const membros = (grupo?.raw?.members || []).map(normalizarMembro)
  const metas = goals.map(normalizarMeta)
  const movimentacoes = metas
    .flatMap((meta) =>
      (meta.raw.contributions || []).map((aporte) => normalizarMovimentacao(aporte, meta))
    )
    .slice(-8)
    .reverse()

  return {
    membros,
    metas,
    movimentacoes,
  }
}

export function useMetas(grupoId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const carregarMetas = useCallback(async () => {
    if (!grupoId) {
      setData(null)
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const [grupo, goals] = await Promise.all([
        buscarGrupo(grupoId),
        listarMetasDoGrupo(grupoId),
      ])
      const dados = normalizarDadosMetas(grupo, goals)
      setData(dados)
      return dados
    } catch (err) {
      setData(dadosMetasVazios)
      setError(err)
      return dadosMetasVazios
    } finally {
      setLoading(false)
    }
  }, [grupoId])

  useEffect(() => {
    Promise.resolve().then(carregarMetas)
  }, [carregarMetas])

  const criarMeta = useCallback(
    async (meta) => {
      await criarMetaGrupo(grupoId, meta)
      return carregarMetas()
    },
    [carregarMetas, grupoId],
  )

  const atualizarMeta = useCallback(
    async (metaId, meta) => {
      await atualizarMetaGrupo(metaId, meta)
      return carregarMetas()
    },
    [carregarMetas],
  )

  const registrarAporte = useCallback(
    async (aporte) => {
      await registrarAporteMeta(aporte)
      return carregarMetas()
    },
    [carregarMetas],
  )

  return {
    data,
    loading,
    error,
    recarregar: carregarMetas,
    criarMeta,
    atualizarMeta,
    registrarAporte,
  }
}
