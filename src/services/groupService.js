import api from './api'

const coresMembros = ['#ff2d87', '#7c2fff', '#ff9f00', '#03fc83', '#2d9cff']

function iniciaisDoEmail(email) {
  return email.slice(0, 2).toUpperCase()
}

function nomeDoEmail(email) {
  return email.split('@')[0]
}

function normalizarMembro(email, index) {
  return {
    id: email,
    email,
    nome: nomeDoEmail(email),
    iniciais: iniciaisDoEmail(email),
    cor: coresMembros[index % coresMembros.length],
    foto: null,
  }
}

export function normalizarGrupo(grupo) {
  const membros = grupo.members || []

  return {
    id: grupo._id,
    nome: grupo.name,
    desc: grupo.description || `${membros.length} membros`,
    descricao: grupo.description,
    membros: membros.map(normalizarMembro),
    imagem: '/casa.jpg',
    raw: grupo,
  }
}

export async function listarGrupos() {
  const response = await api.get('/group')
  return (response.data.groups || []).map(normalizarGrupo)
}

export async function criarGrupo({ nome, membros, descricao }) {
  const response = await api.post('/group', {
    name: nome,
    members: membros,
    description: descricao,
  })
  return response.data
}

export async function buscarGrupo(groupId) {
  const response = await api.get(`/group/${groupId}`)
  return normalizarGrupo(response.data)
}
