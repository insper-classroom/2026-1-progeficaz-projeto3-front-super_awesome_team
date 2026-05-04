import api from './api'

function numeroSeguro(valor) {
  const numero = Number(valor)
  if (Number.isFinite(numero)) return numero
  return 0
}

export function normalizarPendencia(pendencia) {
  return {
    id: pendencia._id || pendencia.id,
    billId: pendencia.bill_id || pendencia.billId,
    devedorEmail: pendencia.debtor_email,
    credorEmail: pendencia.creditor_email,
    valor: numeroSeguro(pendencia.value),
    devedorConfirmou: Boolean(pendencia.debtor_confirmed),
    credorConfirmou: Boolean(pendencia.creditor_confirmed),
    resolvida: Boolean(pendencia.is_resolved),
    criadaEm: pendencia.created_at,
    resolvidaEm: pendencia.resolved_at,
    raw: pendencia,
  }
}

export async function listarPendenciasDoGrupo(groupId) {
  const response = await api.get(`/group/${groupId}/pendencies`)
  return (response.data.pendencies || []).map(normalizarPendencia)
}

export async function confirmarPagamentoComoDevedor(pendencyId) {
  const response = await api.put(`/pendencies/${pendencyId}/confirm-debtor`)
  return response.data
}

export async function confirmarRecebimentoComoCredor(pendencyId) {
  const response = await api.put(`/pendencies/${pendencyId}/confirm-creditor`)
  return response.data
}
