import api from './api'

export async function loginWithEmail({ email, password }) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function registerUser({ name, email, password, confirmPassword }) {
  const response = await api.post('/user', {
    name,
    email,
    password,
    confirm_password: confirmPassword,
  })
  return response.data
}

export async function requestPasswordReset({ email }) {
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

export async function verifyResetCode({ email, code }) {
  const response = await api.post('/auth/verify-reset-code', { email, code })
  return response.data
}

export async function resetPassword({ resetToken, newPassword }) {
  const response = await api.post('/auth/reset-password', {
    reset_token: resetToken,
    new_password: newPassword,
  })
  return response.data
}

export function getGoogleLoginUrl() {
  return `${api.defaults.baseURL}/auth/google`
}

export function getCallbackToken(location) {
  const fragmentParams = new URLSearchParams(location.hash.replace(/^#/, ''))
  return fragmentParams.get('token')
}

export function getCallbackError(location) {
  const params = new URLSearchParams(location.search)
  if (params.get('status') !== 'error') return null
  return params.get('message') || 'Não foi possível concluir a autenticação.'
}
