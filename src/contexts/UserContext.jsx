// Provider dos dados do usuario compartilhados entre os componentes.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { UsuarioContext } from './UsuarioContext'
import { clearAuthToken, getAuthToken, setAuthToken } from '../services/authToken'
import { getCurrentUser } from '../services/userService'

export function UserProvider({ children }) {
  const [foto, setFoto] = useState(null) // foto de perfil do usuário
  const [token, setTokenState] = useState(() => getAuthToken())
  const [usuario, setUsuario] = useState(null)
  const [carregandoUsuario, setCarregandoUsuario] = useState(Boolean(token))

  const salvarToken = useCallback((novoToken) => {
    setAuthToken(novoToken)
    setTokenState(novoToken)
  }, [])

  const sair = useCallback(() => {
    clearAuthToken()
    setTokenState(null)
    setUsuario(null)
    setFoto(null)
    setCarregandoUsuario(false)
  }, [])

  const carregarUsuario = useCallback(async () => {
    if (!getAuthToken()) {
      setUsuario(null)
      setCarregandoUsuario(false)
      return null
    }

    setCarregandoUsuario(true)
    try {
      const dadosUsuario = await getCurrentUser()
      setUsuario(dadosUsuario)
      return dadosUsuario
    } catch {
      setUsuario(null)
      return null
    } finally {
      setCarregandoUsuario(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(carregarUsuario)
  }, [carregarUsuario, token])

  useEffect(() => {
    window.addEventListener('auth:logout', sair)
    return () => window.removeEventListener('auth:logout', sair)
  }, [sair])

  const valor = useMemo(
    () => ({
      foto,
      setFoto,
      token,
      usuario,
      carregandoUsuario,
      autenticado: Boolean(token),
      salvarToken,
      carregarUsuario,
      sair,
    }),
    [carregarUsuario, carregandoUsuario, foto, sair, salvarToken, token, usuario],
  )

  return <UsuarioContext.Provider value={valor}>{children}</UsuarioContext.Provider>
}
