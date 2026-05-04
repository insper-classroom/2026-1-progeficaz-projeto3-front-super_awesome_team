import api from './api'

export async function getCurrentUser() {
  const response = await api.get('/user/me')
  return response.data
}

export async function updateUser(data) {
  const response = await api.put('/user', data)
  return response.data
}

export async function deleteUser(data = {}) {
  const response = await api.delete('/user', {
    data,
  })
  return response.data
}