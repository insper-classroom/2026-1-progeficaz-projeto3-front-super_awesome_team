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

function normalizarDataParaApi(data) {
  if (!data) return null
  if (String(data).includes('T')) return data
  return `${data}T00:00:00`
}

function normalizarMembroParaPagamento(membro) {
  const email = membro.email || membro.id || membro.nome
  const valor = numeroSeguro(membro.valor ?? membro.value)

  return {
    email,
    nome: membro.nome || nomeDoEmail(email),
    valor,
    percentual: membro.percentual,
    pago: Boolean(membro.pago),
    cor: membro.cor,
  }
}

export function normalizarConta(conta) {
  const membros = conta.members_to_pay || conta.membros || []
  const total = numeroSeguro(conta.total_value ?? conta.total)

  return {
    id: conta._id || conta.id || conta.bill_id,
    nome: conta.bill_type || conta.nome || 'Conta sem nome',
    total,
    membros: membros.map((membro) => {
      const membroNormalizado = normalizarMembroParaPagamento(membro)
      return {
        ...membroNormalizado,
        percentual: total ? (membroNormalizado.valor / total) * 100 : 0,
        pago: Boolean(conta.is_paid || membroNormalizado.pago),
      }
    }),
    paga: Boolean(conta.is_paid),
    criadaPor: conta.created_by,
    criadaEm: conta.created_at,
    dueDate: conta.due_date ?? conta.dueDate ?? null,
    raw: conta,
  }
}

export async function listarContasDoGrupo(groupId) {
  const response = await api.get(`/group/${groupId}/bill`)
  return (response.data.bills || []).map(normalizarConta)
}

export async function criarContaGrupo({ grupoId, nome, total, membros, dueDate }) {
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
    due_date: normalizarDataParaApi(dueDate),
  })

  return response.data
}

export async function atualizarContaGrupo(contaId, { nome, total, membros, dueDate }) {
  const membersToPay = membros
    .map(normalizarMembroParaPagamento)
    .filter((membro) => membro.email && membro.valor > 0)
    .map((membro) => ({
      email: membro.email,
      value: membro.valor,
    }))

  const response = await api.put(`/bill/${contaId}`, {
    bill_type: nome,
    total_value: numeroSeguro(total),
    members_to_pay: membersToPay,
    due_date: normalizarDataParaApi(dueDate),
  })

  return response.data
}

export async function marcarContaComoPaga(contaId) {
  const response = await api.put(`/bill/${contaId}/mark-as-paid`)
  return response.data
}
