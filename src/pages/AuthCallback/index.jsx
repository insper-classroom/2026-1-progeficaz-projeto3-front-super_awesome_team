import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../../hooks/useUser'
import { getCallbackError, getCallbackToken } from '../../services/auth'
import styles from '../Login/Login.module.css'

export function AuthCallback() {
  const location = useLocation()
  const navigate = useNavigate()
  const { salvarToken } = useUser()
  const token = getCallbackToken(location)
  const erro = getCallbackError(location)
  const mensagem = useMemo(() => {
    if (token) return 'Conectando sua conta...'
    if (erro) return erro
    return 'Token de autenticação não encontrado.'
  }, [erro, token])

  useEffect(() => {
    if (token) {
      salvarToken(token)
      navigate('/grupos', { replace: true })
    }
  }, [navigate, salvarToken, token])

  return (
    <div className={styles.page}>
      <div className={styles.logoBox}>
        <img src="/logo-icon.png" alt="Adapte" className={styles.logoImg} />
      </div>
      <div className={styles.card}>
        <h1 className={styles.title}>Login Google</h1>
        <p className={styles.subtitle}>{mensagem}</p>
      </div>
    </div>
  )
}
