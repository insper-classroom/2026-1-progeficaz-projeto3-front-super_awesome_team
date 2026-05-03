import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from '../VerifyEmail/VerifyEmail.module.css'

export function EmailVerified() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const status = params.get('status')

  const conteudo = useMemo(() => {
    if (status === 'error') {
      return {
        titulo: 'Não foi possível confirmar seu e-mail',
        mensagem: params.get('message') || 'O link de confirmação é inválido ou expirou.',
      }
    }

    return {
      titulo: 'E-mail confirmado com sucesso',
      mensagem: params.get('message') || 'Sua conta já pode acessar o Adapte Finance.',
    }
  }, [params, status])

  return (
    <div className={styles.page}>
      <div className={styles.illustration}>
        <img src="/verify-email.png" alt="" className={styles.illustrationImg} />
      </div>

      <div className={styles.content}>
        <h1 className={styles.headline}>{conteudo.titulo}</h1>

        <div className={styles.card}>
          <p className={styles.desc}>{conteudo.mensagem}</p>
          <button type="button" className={styles.link} onClick={() => navigate('/login')}>
            Ir para login
          </button>
        </div>
      </div>
    </div>
  )
}
