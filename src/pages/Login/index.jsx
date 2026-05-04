// Página de login — autenticação por e-mail/senha ou Google
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../../hooks/useUser'
import {
  getGoogleLoginUrl,
  loginWithEmail,
  requestPasswordReset,
  resetPassword,
  verifyResetCode,
} from '../../services/auth'
import styles from './Login.module.css'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { salvarToken } = useUser()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostraRecuperacao, setMostraRecuperacao] = useState(false)
  const [etapaRecuperacao, setEtapaRecuperacao] = useState('email')
  const [emailRecuperacao, setEmailRecuperacao] = useState('')
  const [codigoRecuperacao, setCodigoRecuperacao] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [erroRecuperacao, setErroRecuperacao] = useState('')
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState('')
  const [carregandoRecuperacao, setCarregandoRecuperacao] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setMensagem('')
    setCarregando(true)

    try {
      const resposta = await loginWithEmail({
        email,
        password: senha,
      })
      salvarToken(resposta.token)
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

  function limparRecuperacao() {
    setEtapaRecuperacao('email')
    setCodigoRecuperacao('')
    setResetToken('')
    setNovaSenha('')
    setConfirmarNovaSenha('')
    setErroRecuperacao('')
    setMensagemRecuperacao('')
  }

  function abrirRecuperacao() {
    setEmailRecuperacao(email)
    setErro('')
    setMensagem('')
    limparRecuperacao()
    setMostraRecuperacao(true)
  }

  function voltarLogin() {
    limparRecuperacao()
    setMostraRecuperacao(false)
  }

  async function enviarCodigo(emailParaEnvio) {
    setCarregandoRecuperacao(true)

    try {
      const resposta = await requestPasswordReset({ email: emailParaEnvio })
      setEmailRecuperacao(emailParaEnvio)
      setMensagemRecuperacao(
        resposta.message || 'Se o e-mail existir, o código será enviado',
      )
      setEtapaRecuperacao('codigo')
    } catch (error) {
      setErroRecuperacao(
        error.response?.data?.error || 'Não foi possível enviar o código.',
      )
    } finally {
      setCarregandoRecuperacao(false)
    }
  }

  async function handleSolicitarCodigo(e) {
    e.preventDefault()
    setErroRecuperacao('')
    setMensagemRecuperacao('')

    const emailLimpo = emailRecuperacao.trim()
    if (!emailLimpo) {
      setErroRecuperacao('Informe seu e-mail.')
      return
    }

    await enviarCodigo(emailLimpo)
  }

  async function handleReenviarCodigo() {
    setErroRecuperacao('')
    setMensagemRecuperacao('')

    const emailLimpo = emailRecuperacao.trim()
    if (!emailLimpo) {
      setEtapaRecuperacao('email')
      setErroRecuperacao('Informe seu e-mail.')
      return
    }

    await enviarCodigo(emailLimpo)
  }

  async function handleValidarCodigo(e) {
    e.preventDefault()
    setErroRecuperacao('')
    setMensagemRecuperacao('')

    const codigoLimpo = codigoRecuperacao.trim()
    if (!codigoLimpo) {
      setErroRecuperacao('Informe o código recebido.')
      return
    }

    setCarregandoRecuperacao(true)
    try {
      const resposta = await verifyResetCode({
        email: emailRecuperacao.trim(),
        code: codigoLimpo,
      })
      setResetToken(resposta.reset_token)
      setEtapaRecuperacao('senha')
    } catch (error) {
      setErroRecuperacao(
        error.response?.data?.error || 'Não foi possível validar o código.',
      )
    } finally {
      setCarregandoRecuperacao(false)
    }
  }

  async function handleRedefinirSenha(e) {
    e.preventDefault()
    setErroRecuperacao('')
    setMensagemRecuperacao('')

    if (!novaSenha) {
      setErroRecuperacao('Informe a nova senha.')
      return
    }

    if (novaSenha.length < 6) {
      setErroRecuperacao('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErroRecuperacao('As senhas não conferem.')
      return
    }

    setCarregandoRecuperacao(true)
    try {
      await resetPassword({
        resetToken,
        newPassword: novaSenha,
      })
      setEmail(emailRecuperacao)
      setSenha('')
      setMensagem('Senha alterada com sucesso. Entre com a nova senha.')
      limparRecuperacao()
      setMostraRecuperacao(false)
    } catch (error) {
      setErroRecuperacao(
        error.response?.data?.error || 'Não foi possível redefinir a senha.',
      )
    } finally {
      setCarregandoRecuperacao(false)
    }
  }

  function renderFormularioRecuperacao() {
    if (etapaRecuperacao === 'codigo') {
      return (
        <form className={styles.inputGroup} onSubmit={handleValidarCodigo}>
          <p className={styles.helperText}>{emailRecuperacao}</p>
          <input
            className={styles.input}
            type="text"
            inputMode="numeric"
            placeholder="Código recebido *"
            value={codigoRecuperacao}
            onChange={(e) => setCodigoRecuperacao(e.target.value)}
            maxLength={6}
            required
          />
          {mensagemRecuperacao && (
            <p className={styles.successMessage}>{mensagemRecuperacao}</p>
          )}
          {erroRecuperacao && (
            <p className={styles.errorMessage}>{erroRecuperacao}</p>
          )}
          <button
            type="submit"
            className={`${styles.submitBtn} ${styles.compactSubmitBtn}`}
            disabled={carregandoRecuperacao}
          >
            {carregandoRecuperacao ? 'Validando...' : 'Validar código'}
          </button>
          <div className={styles.secondaryActions}>
            <button
              type="button"
              className={styles.secondaryLink}
              onClick={handleReenviarCodigo}
              disabled={carregandoRecuperacao}
            >
              Reenviar código
            </button>
            <button
              type="button"
              className={styles.secondaryLink}
              onClick={() => setEtapaRecuperacao('email')}
              disabled={carregandoRecuperacao}
            >
              Trocar e-mail
            </button>
          </div>
        </form>
      )
    }

    if (etapaRecuperacao === 'senha') {
      return (
        <form className={styles.inputGroup} onSubmit={handleRedefinirSenha}>
          <input
            className={styles.input}
            type="password"
            placeholder="Nova senha *"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Confirmar nova senha *"
            value={confirmarNovaSenha}
            onChange={(e) => setConfirmarNovaSenha(e.target.value)}
            required
          />
          {erroRecuperacao && (
            <p className={styles.errorMessage}>{erroRecuperacao}</p>
          )}
          <button
            type="submit"
            className={`${styles.submitBtn} ${styles.compactSubmitBtn}`}
            disabled={carregandoRecuperacao}
          >
            {carregandoRecuperacao ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      )
    }

    return (
      <form className={styles.inputGroup} onSubmit={handleSolicitarCodigo}>
        <input
          className={styles.input}
          type="email"
          placeholder="Email *"
          value={emailRecuperacao}
          onChange={(e) => setEmailRecuperacao(e.target.value)}
          required
        />
        {erroRecuperacao && <p className={styles.errorMessage}>{erroRecuperacao}</p>}
        <button
          type="submit"
          className={`${styles.submitBtn} ${styles.compactSubmitBtn}`}
          disabled={carregandoRecuperacao}
        >
          {carregandoRecuperacao ? 'Enviando...' : 'Enviar código'}
        </button>
      </form>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.logoBox}>
        <img src="/logo-icon.png" alt="Adapte" className={styles.logoImg} />
      </div>

      <div className={styles.card}>
        {mostraRecuperacao ? (
          <>
            <h1 className={styles.title}>Recuperar senha</h1>
            <p className={styles.subtitle}>
              {etapaRecuperacao === 'email' &&
                'Receba um código no e-mail da sua conta'}
              {etapaRecuperacao === 'codigo' &&
                'Informe o código enviado para continuar'}
              {etapaRecuperacao === 'senha' && 'Crie uma nova senha de acesso'}
            </p>

            {renderFormularioRecuperacao()}

            <button type="button" className={styles.linkBtn} onClick={voltarLogin}>
              Voltar ao login
            </button>
          </>
        ) : (
          <>
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
              <button
                type="button"
                className={styles.forgotBtn}
                onClick={abrirRecuperacao}
              >
                Esqueceu a sua senha?
              </button>
              {mensagem && <p className={styles.successMessage}>{mensagem}</p>}
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
          </>
        )}
      </div>
    </div>
  )
}
