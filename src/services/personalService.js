import api from './api'

function numeroSeguro(valor) {
  const numero = Number(valor)
  if (Number.isFinite(numero)) return numero
  return 0
}

function dataParaDespesa(data) {
  if (!data) return undefined
  return `${data}T12:00:00Z`
}

export async function obterResumoPessoal() {
  const response = await api.get('/personal/summary')
  return response.data
}

export async function criarDespesaPessoal({ categoria, valor, data }) {
  const response = await api.post('/expense', {
    expense_type: categoria,
    value: numeroSeguro(valor),
    expense_date: dataParaDespesa(data),
  })

  return response.data
}

export async function deletarDespesaPessoal(expenseId) {
  const response = await api.delete(`/expense/${expenseId}`)
  return response.data
}
