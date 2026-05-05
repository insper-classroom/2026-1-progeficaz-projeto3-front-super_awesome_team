import { useCallback, useEffect, useState } from 'react'
import { obterResumoPessoal } from '../services/personalService'

const dadosVazios = {
  resumo: {
    totalDespesas: 0,
    totalPago: 0,
    totalRecebido: 0,
    totalAportes: 0,
    totalRegistrosDespesa: 0,
    totalRegistrosAporte: 0,
    totalGrupos: 0,
  },
  despesas: [],
  vencimentos: [],
  aportes: [],
  graficos: {
    categorias: [],
    aportesPorMeta: [],
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
  const papel = expense.role === 'creditor' ? 'creditor' : 'debtor'

  return {
    id: expense._id || expense.id,
    contaId: expense.bill_id,
    grupoId: expense.group_id,
    nomeGrupo: expense.group_name || 'Grupo',
    categoria: expense.category || 'Sem categoria',
    valor: numeroSeguro(expense.value),
    data: expense.date,
    dataValor: dataParaInput(expense.date),
    papel,
    papelTexto: papel === 'creditor' ? 'Recebido' : 'Pago',
    devedorEmail: expense.debtor_email,
    credorEmail: expense.creditor_email,
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

function normalizarVencimento(expense) {
  const papel = expense.role === 'creditor' ? 'creditor' : 'debtor'

  return {
    id: expense._id || expense.id,
    contaId: expense.bill_id,
    grupoId: expense.group_id,
    nomeGrupo: expense.group_name || 'Grupo',
    categoria: expense.category || 'Sem categoria',
    valor: numeroSeguro(expense.value),
    data: expense.due_date,
    dataValor: dataParaInput(expense.due_date),
    papel,
    papelTexto: papel === 'creditor' ? 'A receber' : 'A pagar',
    resolvido: Boolean(expense.resolved),
    devedorEmail: expense.debtor_email,
    credorEmail: expense.creditor_email,
    devedorConfirmou: Boolean(expense.debtor_confirmed),
    credorConfirmou: Boolean(expense.creditor_confirmed),
  }
}

function normalizarDadosPessoais(data) {
  const summary = data?.summary || {}
  const charts = data?.charts || {}

  return {
    resumo: {
      totalDespesas: numeroSeguro(summary.total_expenses),
      totalPago: numeroSeguro(summary.total_paid),
      totalRecebido: numeroSeguro(summary.total_received),
      totalAportes: numeroSeguro(summary.total_contributions),
      totalRegistrosDespesa: numeroSeguro(summary.expense_count),
      totalRegistrosAporte: numeroSeguro(summary.contribution_count),
      totalGrupos: numeroSeguro(summary.group_count),
    },
    despesas: (data?.expenses || []).map(normalizarDespesa),
    vencimentos: (data?.due_expenses || []).map(normalizarVencimento),
    aportes: (data?.contributions || []).map(normalizarAporte),
    graficos: {
      categorias: charts.expenses_by_category || [],
      aportesPorMeta: charts.contributions_by_goal || [],
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

  return {
    data,
    loading,
    error,
    recarregar: carregar,
  }
}
