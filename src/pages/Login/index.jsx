// Página de login — autenticação por e-mail/senha ou Google
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../../hooks/useUser'
import { getGoogleLoginUrl, loginWithEmail } from '../../services/auth'
import styles from './Login.module.css'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { salvarToken } = useUser()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const resposta = await loginWithEmail({
        email,
        password: senha,
      })
      salvarToken(resposta.data.token)
      navigate(location.state?.from?.pathname || '/grupos', { replace: true })
    } catch (error) {
      setErro(error.response?.data?.error || 'Não foi possível entrar.')
    } finally {
      setCarregando(false)
    }
  }

  function handleGoogleLogin() {
    window.location.href = getGoogleLoginUrl()
  }

  return (
    <div className={styles.page}>
      <div className={styles.logoBox}>
        <img src="/logo-icon.png" alt="Adapte" className={styles.logoImg} />
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <p className={styles.subtitle}>
          Entre na sua conta preenchendo os campos abaixo
        </p>

        <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin}>
          <img src="/google-icon.png" alt="" className={styles.googleIcon} />
          Entre com o Google
        </button>

        <form className={styles.inputGroup} onSubmit={handleLogin}>
          <input
            className={styles.input}
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Senha *"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          {erro && <p className={styles.errorMessage}>{erro}</p>}
          <button type="submit" className={styles.submitBtn} disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className={styles.or}>OU</p>

        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => navigate('/cadastro')}
        >
          Cadastre-se agora
        </button>
      </div>
    </div>
  )
}
