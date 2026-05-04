import { useCallback, useEffect, useState } from 'react'
import {
  criarDespesaPessoal,
  deletarDespesaPessoal,
  obterResumoPessoal,
} from '../services/personalService'

const dadosVazios = {
  resumo: {
    totalDespesas: 0,
    totalAportes: 0,
    saldo: 0,
    totalRegistrosDespesa: 0,
    totalRegistrosAporte: 0,
  },
  despesas: [],
  aportes: [],
  graficos: {
    categorias: [],
    aportesPorMeta: [],
    fluxoMensal: [],
  },
}

function numeroSeguro(valor) {
  const numero = Number(valor)
  if (Number.isFinite(numero)) return numero
  return 0
}

function dataParaInput(valor) {
  if (!valor) return ''
  return String(valor).slice(0, 10)
}

function normalizarDespesa(expense) {
  return {
    id: expense._id || expense.id,
    categoria: expense.expense_type || 'Sem categoria',
    valor: numeroSeguro(expense.value),
    data: expense.expense_date,
    dataValor: dataParaInput(expense.expense_date),
  }
}

function normalizarAporte(contribution) {
  return {
    id: `${contribution.goal_id}-${contribution.contribution_index}`,
    metaId: contribution.goal_id,
    nomeMeta: contribution.goal_name || 'Meta',
    grupoId: contribution.group_id,
    nomeGrupo: contribution.group_name || 'Grupo',
    valor: numeroSeguro(contribution.value),
    data: contribution.contributed_at,
    dataValor: dataParaInput(contribution.contributed_at),
  }
}

function normalizarDadosPessoais(data) {
  const summary = data?.summary || {}
  const charts = data?.charts || {}

  return {
    resumo: {
      totalDespesas: numeroSeguro(summary.total_expenses),
      totalAportes: numeroSeguro(summary.total_contributions),
      saldo: numeroSeguro(summary.balance),
      totalRegistrosDespesa: numeroSeguro(summary.expense_count),
      totalRegistrosAporte: numeroSeguro(summary.contribution_count),
    },
    despesas: (data?.expenses || []).map(normalizarDespesa),
    aportes: (data?.contributions || []).map(normalizarAporte),
    graficos: {
      categorias: charts.expenses_by_category || [],
      aportesPorMeta: charts.contributions_by_goal || [],
      fluxoMensal: charts.monthly_flow || [],
    },
  }
}

export function usePessoal() {
  const [data, setData] = useState(dadosVazios)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await obterResumoPessoal()
      const dadosNormalizados = normalizarDadosPessoais(response)
      setData(dadosNormalizados)
      setError(null)
      return dadosNormalizados
    } catch (erro) {
      setData(dadosVazios)
      setError(erro)
      return dadosVazios
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(carregar)
  }, [carregar])

  const criarDespesa = useCallback(
    async (despesa) => {
      await criarDespesaPessoal(despesa)
      return carregar()
    },
    [carregar],
  )

  const deletarDespesa = useCallback(
    async (expenseId) => {
      await deletarDespesaPessoal(expenseId)
      return carregar()
    },
    [carregar],
  )

  return {
    data,
    loading,
    error,
    recarregar: carregar,
    criarDespesa,
    deletarDespesa,
  }
}
