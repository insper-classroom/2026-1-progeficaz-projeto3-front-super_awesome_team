import { useEffect, useState } from 'react'
import { listarContasDoGrupo } from '../services/billService'
import { listarMetasDoGrupo } from '../services/goalService'
import { buscarGrupo } from '../services/groupService'
import { getMockVisaoGeral } from '../services/mockData'
import { getCurrentUser } from '../services/userService'
import { calcularVariacaoPercentual } from '../utils/variacaoFinanceira'
import { normalizarDadosMetas } from './useMetas'

const MS_POR_DIA = 1000 * 60 * 60 * 24

const coresCategorias = ['#ff2d87', '#ff9f00', '#7c2fff', '#03fc83', '#2d9cff']

const configuracaoPeriodo = {
  '7d': { tipo: 'dias', dias: 7, labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'], cumulativo: true },
  '30d': { tipo: 'dias', dias: 30, labels: ['1', '10', '20', '30'], cumulativo: true },
  '3m': { tipo: 'meses', meses: 3, cumulativo: false },
  '6m': { tipo: 'meses', meses: 6, cumulativo: false },
  '1a': { tipo: 'meses', meses: 12, cumulativo: false },
}

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

function adicionarDias(data, dias) {
  const novaData = new Date(data)
  novaData.setDate(novaData.getDate() + dias)
  return novaData
}

function adicionarMeses(data, meses) {
  return new Date(data.getFullYear(), data.getMonth() + meses, 1)
}

function obterDataConta(conta) {
  if (!conta.criadaEm) return new Date()

  const data = new Date(conta.criadaEm)
  if (Number.isNaN(data.getTime())) return new Date()
  return data
}

function somarValores(contas) {
  return contas.reduce((total, conta) => total + conta.total, 0)
}

function acumular(valores) {
  let soma = 0
  return valores.map((valor) => {
    soma += valor
    return soma
  })
}

function abreviarMes(data) {
  return data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

function montarEvolucaoPorDias(contas, periodoConfig) {
  const hoje = inicioDoDia(new Date())
  const inicioAtual = adicionarDias(hoje, -(periodoConfig.dias - 1))
  const fimAtual = adicionarDias(hoje, 1)
  const inicioAnterior = adicionarDias(inicioAtual, -periodoConfig.dias)
  const fimAnterior = inicioAtual

  const curr = Array(periodoConfig.dias).fill(0)
  const prev = Array(periodoConfig.dias).fill(0)

  contas.forEach((conta) => {
    const data = inicioDoDia(obterDataConta(conta))

    if (data >= inicioAtual && data < fimAtual) {
      const indice = Math.floor((data - inicioAtual) / MS_POR_DIA)
      curr[indice] += conta.total
      return
    }

    if (data >= inicioAnterior && data < fimAnterior) {
      const indice = Math.floor((data - inicioAnterior) / MS_POR_DIA)
      prev[indice] += conta.total
    }
  })

  return {
    atual: contas.filter((conta) => {
      const data = obterDataConta(conta)
      return data >= inicioAtual && data < fimAtual
    }),
    anterior: contas.filter((conta) => {
      const data = obterDataConta(conta)
      return data >= inicioAnterior && data < fimAnterior
    }),
    evolucao: {
      curr: periodoConfig.cumulativo ? acumular(curr) : curr,
      prev: periodoConfig.cumulativo ? acumular(prev) : prev,
      labels: periodoConfig.labels,
      cumulativo: periodoConfig.cumulativo,
    },
  }
}

function montarEvolucaoPorMeses(contas, periodoConfig) {
  const inicioMesAtual = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const inicioAtual = adicionarMeses(inicioMesAtual, -(periodoConfig.meses - 1))
  const fimAtual = adicionarMeses(inicioMesAtual, 1)
  const inicioAnterior = adicionarMeses(inicioAtual, -periodoConfig.meses)
  const fimAnterior = inicioAtual

  const curr = Array(periodoConfig.meses).fill(0)
  const prev = Array(periodoConfig.meses).fill(0)
  const labels = Array.from({ length: periodoConfig.meses }, (_, indice) =>
    abreviarMes(adicionarMeses(inicioAtual, indice))
  )

  contas.forEach((conta) => {
    const data = obterDataConta(conta)
    const dataMes = new Date(data.getFullYear(), data.getMonth(), 1)

    if (dataMes >= inicioAtual && dataMes < fimAtual) {
      const indice = (dataMes.getFullYear() - inicioAtual.getFullYear()) * 12 + dataMes.getMonth() - inicioAtual.getMonth()
      curr[indice] += conta.total
      return
    }

    if (dataMes >= inicioAnterior && dataMes < fimAnterior) {
      const indice = (dataMes.getFullYear() - inicioAnterior.getFullYear()) * 12 + dataMes.getMonth() - inicioAnterior.getMonth()
      prev[indice] += conta.total
    }
  })

  return {
    atual: contas.filter((conta) => {
      const data = obterDataConta(conta)
      return data >= inicioAtual && data < fimAtual
    }),
    anterior: contas.filter((conta) => {
      const data = obterDataConta(conta)
      return data >= inicioAnterior && data < fimAnterior
    }),
    evolucao: {
      curr,
      prev,
      labels,
      cumulativo: periodoConfig.cumulativo,
    },
  }
}

function agruparCategorias(contas, contasAnteriores) {
  const totaisAtuais = new Map()
  const totaisAnteriores = new Map()
  const totalAtual = somarValores(contas)

  contas.forEach((conta) => {
    totaisAtuais.set(conta.nome, (totaisAtuais.get(conta.nome) || 0) + conta.total)
  })

  contasAnteriores.forEach((conta) => {
    totaisAnteriores.set(conta.nome, (totaisAnteriores.get(conta.nome) || 0) + conta.total)
  })

  const categorias = [...totaisAtuais.entries()]
    .sort(([, valorA], [, valorB]) => valorB - valorA)
    .slice(0, 5)
    .map(([nome, valor], indice) => ({
      nome,
      valor,
      pct: totalAtual ? Math.round((valor / totalAtual) * 100) : 0,
      cor: coresCategorias[indice % coresCategorias.length],
    }))

  const categoriasPrev = categorias.map((categoria) => {
    const valorAnterior = totaisAnteriores.get(categoria.nome) || 0
    const variacaoPct = calcularVariacaoPercentual(categoria.valor, valorAnterior)

    return {
      nome: categoria.nome,
      valor: valorAnterior,
      variacaoPct: variacaoPct === null ? null : Math.round(variacaoPct),
    }
  })

  return { categorias, categoriasPrev }
}

function calcularVoceDeve(contas, emailUsuario) {
  if (!emailUsuario) return 0

  return contas.reduce((total, conta) => {
    if (conta.paga || conta.criadaPor === emailUsuario) return total

    const valorUsuario = conta.membros.find((membro) => membro.email === emailUsuario)?.valor || 0
    return total + valorUsuario
  }, 0)
}

function montarVisaoGeralDoBackend(grupoId, periodo, contas, usuario, metas) {
  const mock = getMockVisaoGeral(grupoId, periodo)
  const periodoConfig = configuracaoPeriodo[periodo] || configuracaoPeriodo['30d']
  const dadosPeriodo = periodoConfig.tipo === 'meses'
    ? montarEvolucaoPorMeses(contas, periodoConfig)
    : montarEvolucaoPorDias(contas, periodoConfig)
  const { categorias, categoriasPrev } = agruparCategorias(dadosPeriodo.atual, dadosPeriodo.anterior)

  return {
    ...mock,
    grupo: {
      ...mock.grupo,
      id: grupoId,
    },
    totalAtual: somarValores(dadosPeriodo.atual),
    totalAnterior: somarValores(dadosPeriodo.anterior),
    voceDeVe: calcularVoceDeve(contas, usuario?.email),
    categorias,
    categoriasPrev,
    evolucao: dadosPeriodo.evolucao,
    metas,
  }
}

export function useVisaoGeral(grupoId, periodo = '30d') {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ativo = true

    async function carregarVisaoGeral() {
      if (!grupoId) {
        setData(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [contas, usuario, grupo, goals] = await Promise.all([
          listarContasDoGrupo(grupoId),
          getCurrentUser(),
          buscarGrupo(grupoId),
          listarMetasDoGrupo(grupoId),
        ])
        const metas = normalizarDadosMetas(grupo, goals).metas

        if (!ativo) return
        setData(montarVisaoGeralDoBackend(grupoId, periodo, contas, usuario, metas))
      } catch (err) {
        if (!ativo) return
        // Fallback mantido: se a API de contas/metas falhar, a visão geral continua usando mockData.
        setData(getMockVisaoGeral(grupoId, periodo))
        setError(err)
      } finally {
        if (ativo) setLoading(false)
      }
    }

    carregarVisaoGeral()

    return () => {
      ativo = false
    }
  }, [grupoId, periodo])

  return { data, loading, error }
}
