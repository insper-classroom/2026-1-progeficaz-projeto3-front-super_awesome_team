import api from './api'

function numeroSeguro(valor) {
  const numero = Number(valor)
  if (Number.isFinite(numero)) return numero
  return 0
}

function nomeDoEmail(email) {
  if (!email) return 'Membro'
  return email.split('@')[0]
}

function normalizarMembroParaPagamento(membro) {
  const email = membro.email || membro.id || membro.nome

  return {
    email,
    nome: membro.nome || nomeDoEmail(email),
    valor: numeroSeguro(membro.valor),
    percentual: membro.percentual,
  }
}

export function normalizarConta(conta) {
  const membros = conta.members_to_pay || conta.membros || []

  return {
    id: conta._id || conta.id || conta.bill_id,
    nome: conta.bill_type || conta.nome || 'Conta sem nome',
    total: numeroSeguro(conta.total_value ?? conta.total),
    membros: membros.map(normalizarMembroParaPagamento),
    paga: Boolean(conta.is_paid),
    criadaPor: conta.created_by,
    criadaEm: conta.created_at,
    raw: conta,
  }
}

export async function listarContasDoGrupo(groupId) {
  const response = await api.get(`/group/${groupId}/bill`)
  return (response.data.bills || []).map(normalizarConta)
}

export async function criarContaGrupo({ grupoId, nome, total, membros }) {
  const membersToPay = membros
    .map(normalizarMembroParaPagamento)
    .filter((membro) => membro.email && membro.valor > 0)
    .map((membro) => ({
      email: membro.email,
      value: membro.valor,
    }))

  const response = await api.post('/bill', {
    bill_type: nome,
    total_value: numeroSeguro(total),
    group_id: grupoId,
    members_to_pay: membersToPay,
  })

  return response.data
}

export async function marcarContaComoPaga(contaId) {
  const response = await api.put(`/bill/${contaId}/mark-as-paid`)
  return response.data
}
