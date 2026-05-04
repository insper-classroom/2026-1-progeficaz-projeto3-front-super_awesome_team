import api from './api'

function numeroSeguro(valor) {
  const numero = Number(valor)
  if (Number.isFinite(numero)) return numero
  return 0
}

function prazoParaData(prazoData) {
  if (!prazoData) return null

  const [ano, mes] = prazoData.split('-').map(Number)
  if (!ano || !mes) return null

  const ultimoDia = new Date(ano, mes, 0).getDate()
  return `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`
}

function dataParaAporte(data) {
  if (!data) return undefined
  return `${data}T12:00:00Z`
}

function montarPayloadMeta(meta, grupoId) {
  const payload = {
    name: meta.nome,
    target_value: numeroSeguro(meta.total),
    due_date: prazoParaData(meta.prazoData),
    icon: meta.icone,
    members: meta.membrosIds || [],
  }

  if (grupoId) {
    payload.group_id = grupoId
  }

  return payload
}

export async function listarMetasDoGrupo(groupId) {
  const response = await api.get(`/group/${groupId}/goal`)
  return response.data.goals || []
}

export async function criarMetaGrupo(groupId, meta) {
  const response = await api.post('/goal', montarPayloadMeta(meta, groupId))
  return response.data
}

export async function atualizarMetaGrupo(goalId, meta) {
  const response = await api.put(`/goal/${goalId}`, montarPayloadMeta(meta))
  return response.data
}

export async function deletarMetaGrupo(goalId) {
  const response = await api.delete(`/goal/${goalId}`)
  return response.data
}

export async function registrarAporteMeta({ metaId, membroId, valor, data }) {
  const response = await api.post(`/goal/${metaId}/contribution`, {
    value: numeroSeguro(valor),
    member_email: membroId,
    contributed_at: dataParaAporte(data),
  })

  return response.data
}

export async function atualizarAporteMeta({ metaId, contributionIndex, membroId, valor, data }) {
  const response = await api.put(`/goal/${metaId}/contribution/${contributionIndex}`, {
    value: numeroSeguro(valor),
    member_email: membroId,
    contributed_at: dataParaAporte(data),
  })

  return response.data
}
