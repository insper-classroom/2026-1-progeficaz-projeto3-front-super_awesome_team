import api from './api'
import { decodeImageFromBase64 } from '../utils/imageUtils'

const coresMembros = ['#ff2d87', '#7c2fff', '#ff9f00', '#03fc83', '#2d9cff']

function nomeDoEmail(email) {
  return email.split('@')[0]
}

function normalizarMembro(membro, index) {
  const email = typeof membro === 'string' ? membro : membro.email
  const nome =
    typeof membro === 'string'
      ? nomeDoEmail(email)
      : membro.name || membro.nome || nomeDoEmail(email)
  const foto = typeof membro === 'string'
    ? null
    : decodeImageFromBase64(membro.image || membro.foto)

  return {
    id: email,
    email,
    nome,
    iniciais: nome.slice(0, 2).toUpperCase(),
    cor: coresMembros[index % coresMembros.length],
    foto,
  }
}

function obterDataCriacao(grupo) {
  if (grupo.created_at || grupo.createdAt || grupo.created) {
    return grupo.created_at || grupo.createdAt || grupo.created
  }

  if (/^[a-f\d]{24}$/i.test(grupo._id || '')) {
    return new Date(parseInt(grupo._id.slice(0, 8), 16) * 1000).toISOString()
  }

  return null
}

export function normalizarGrupo(grupo) {
  const membros = grupo.member_details || grupo.members || []
  const imagem = decodeImageFromBase64(grupo.image || grupo.imagem) || '/casa.jpg'
  const criadoEm = obterDataCriacao(grupo)

  return {
    id: grupo._id,
    nome: grupo.name,
    desc: criadoEm,
    criadoEm,
    created_by: grupo.created_by,
    membros: membros.map(normalizarMembro),
    imagem,
    raw: grupo,
  }
}

export async function listarGrupos() {
  const response = await api.get('/group')
  return (response.data.groups || []).map(normalizarGrupo)
}

export async function criarGrupo({ nome, membros, descricao, imagem }) {
  const response = await api.post('/group', {
    name: nome,
    members: membros,
    description: descricao || '',
    image: imagem || null,
  })
  return response.data
}

export async function atualizarGrupo(groupId, { nome, membros, descricao, imagem, created_by }) {
  const response = await api.put(`/group/${groupId}`, {
    name: nome,
    members: membros,
    description: descricao || '',
    image: imagem,
    created_by,
  })
  return response.data
}

export async function deletarGrupo(groupId) {
  const response = await api.delete(`/group/${groupId}`)
  return response.data
}

export async function buscarGrupo(groupId) {
  const response = await api.get(`/group/${groupId}`)
  return normalizarGrupo(response.data)
}
