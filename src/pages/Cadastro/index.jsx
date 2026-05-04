// Página de cadastro — criação de nova conta
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGoogleLoginUrl, registerUser } from '../../services/auth'
import styles from './Cadastro.module.css'

export function Cadastro() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleCadastro(e) {
    e.preventDefault()
    setErro('')

    if (senha !== confirmarSenha) {
      setErro('As senhas não conferem.')
      return
    }

    setCarregando(true)
    try {
      await registerUser({
        name: nome,
        email,
        password: senha,
        confirmPassword: confirmarSenha,
      })
      navigate('/verificar-email', { state: { email } })
    } catch (error) {
      const resposta = error.response?.data
      setErro(resposta?.error || resposta?.confirm_password?.[0] || 'Não foi possível criar a conta.')
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
        <h1 className={styles.title}>Inscrever-se</h1>
        <p className={styles.subtitle}>
          Inscreva-se gratuitamente e adapte com a gente
        </p>

        <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin}>
          <img src="/google-icon.png" alt="" className={styles.googleIcon} />
          Entre com o Google
        </button>

        <form className={styles.inputGroup} onSubmit={handleCadastro}>
          <input
            className={styles.input}
            type="text"
            placeholder="Nome *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
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
          <input
            className={styles.input}
            type="password"
            placeholder="Confirmar senha *"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
          {erro && <p className={styles.errorMessage}>{erro}</p>}
          <button type="submit" className={styles.submitBtn} disabled={carregando}>
            {carregando ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className={styles.or}>OU</p>

        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => navigate('/login')}
        >
          Já sou cadastrado
        </button>
      </div>
    </div>
  )
}
