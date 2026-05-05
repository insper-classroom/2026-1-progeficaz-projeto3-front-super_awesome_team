import api from './api'

export async function obterResumoPessoal() {
  const response = await api.get('/personal/summary')
  return response.data
}
