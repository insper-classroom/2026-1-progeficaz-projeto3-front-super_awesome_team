// Pagina de perfil: exibe dados do usuario, edicao basica e acao de sair da conta.
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiAlertTriangle, FiCamera, FiEdit2, FiLock, FiLogOut, FiSave, FiX } from 'react-icons/fi'
import styles from './Perfil.module.css'
import { useUser } from '../../hooks/useUser'
import { updateUser, deleteUser } from '../../services/userService'
import { decodeImageFromBase64, encodeImageToBase64 } from '../../utils/imageUtils'

function obterTextoNascimento(nascimento) {
  if (nascimento) return nascimento
  return 'Nao informado'
}

export function Perfil() {
  const navigate = useNavigate()
  const { carregarUsuario, foto, sair, setFoto, usuario } = useUser()
  const inputFoto = useRef(null)

  const [editando, setEditando] = useState(false)
  const [alterandoSenha, setAlterandoSenha] = useState(false)
  const [nome, setNome] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [mensagemSenha, setMensagemSenha] = useState('')
  const [mensagemPerfil, setMensagemPerfil] = useState('')
  const [confirmandoDelete, setConfirmandoDelete] = useState(false)
  const [senhaDelete, setSenhaDelete] = useState('')
  const [mensagemDelete, setMensagemDelete] = useState('')

  const email = usuario?.email || ''
  const nomeExibido = usuario?.name || 'Nome do usuario'
  const textoNascimento = obterTextoNascimento(nascimento)
  const isGoogleUser = usuario?.auth_provider === 'google'

  let srcFoto = '/imagem_padrao_perfil.png'
  if (foto) {
    srcFoto = foto
  }

  useEffect(() => {
    if (!confirmandoDelete) return undefined

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setMensagemDelete('')
        setSenhaDelete('')
        setConfirmandoDelete(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [confirmandoDelete])

  async function aoEscolherFoto(e) {
    const arquivo = e.target.files[0]
    if (!arquivo) return

    const encoded = await encodeImageToBase64(arquivo)
    setFoto(decodeImageFromBase64(encoded))
    try {
      await updateUser({ image: encoded })
    } catch (error) {
      setMensagemPerfil(error.response?.data?.error || 'Não foi possível salvar a foto.')
    }
  }

  function abrirSeletorFoto() {
    inputFoto.current.click()
  }

  async function salvarPerfil() {
    setMensagemPerfil('')

    try {
      await updateUser({ name: nome })
      await carregarUsuario()
      setEditando(false)
    } catch (error) {
      setMensagemPerfil(error.response?.data?.error || 'Não foi possível salvar o perfil.')
    }
  }

  function cancelarEdicao() {
    setNome(nomeExibido)
    setMensagemPerfil('')
    setEditando(false)
  }

  function limparCamposSenha() {
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmarNovaSenha('')
    setMensagemSenha('')
  }

  function abrirAlteracaoSenha() {
    setAlterandoSenha(true)
  }

  function cancelarAlteracaoSenha() {
    limparCamposSenha()
    setAlterandoSenha(false)
  }

  async function salvarSenha() {
    if (!senhaAtual) {
      setMensagemSenha('Informe a senha atual.')
      return
    }

    if (!novaSenha) {
      setMensagemSenha('Informe a nova senha.')
      return
    }

    if (novaSenha !== confirmarNovaSenha) {
      setMensagemSenha('As senhas nao conferem.')
      return
    }

    try {
      await updateUser({
        password: novaSenha,
        current_password: senhaAtual,
      })
      limparCamposSenha()
      setAlterandoSenha(false)
    } catch (error) {
      setMensagemSenha(error.response?.data?.error || 'Não foi possível alterar a senha.')
    }
  }

  function sairDaConta() {
    sair()
    navigate('/login')
  }

  function abrirExcluirConta() {
    setMensagemDelete('')
    setSenhaDelete('')
    setConfirmandoDelete(true)
  }

  function cancelarExclusao() {
    setMensagemDelete('')
    setSenhaDelete('')
    setConfirmandoDelete(false)
  }

  async function excluirConta(e) {
    e?.preventDefault()
    setMensagemDelete('')

    try {
      await deleteUser(isGoogleUser ? {} : { password: senhaDelete })
      sair()
      navigate('/login')
    } catch (error) {
      setMensagemDelete(error.response?.data?.error || 'Não foi possível excluir a conta.')
    }
  }

  function renderizarCampoNome() {
    if (editando) {
      return (
        <input
          className={styles.input}
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      )
    }

    return <span className={styles.valorCampo}>{nomeExibido}</span>
  }

  function renderizarCampoNascimento() {
    if (editando) {
      return (
        <input
          className={styles.input}
          type="date"
          value={nascimento}
          onChange={(e) => setNascimento(e.target.value)}
        />
      )
    }

    return <span className={styles.valorCampo}>{textoNascimento}</span>
  }

  function renderizarCampoSenha() {
    if (isGoogleUser) {
    return <span className={styles.valorCampo}>Conta vinculada ao Google</span>
  }

    if (alterandoSenha) {
      return (
        <div className={styles.formSenha}>
          <input
            className={styles.input}
            type="password"
            placeholder="Senha atual"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmarNovaSenha}
            onChange={(e) => setConfirmarNovaSenha(e.target.value)}
          />

          <div className={styles.acoesSenha}>
            <button type="button" className={styles.botaoSecundario} onClick={cancelarAlteracaoSenha}>
              <FiX />
              Cancelar
            </button>
            <button type="button" className={styles.botaoPrimario} onClick={salvarSenha}>
              <FiSave />
              Salvar senha
            </button>
          </div>

          <span className={styles.mensagemSenha}>{mensagemSenha}</span>
        </div>
      )
    }

    return (
      <div className={styles.senhaResumo}>
        <span className={styles.valorCampo}>********</span>
        <button type="button" className={styles.botaoTexto} onClick={abrirAlteracaoSenha}>
          <FiLock />
          Alterar senha
        </button>
      </div>
    )
  }

  function renderizarAcoesPerfil() {
    if (editando) {
      return (
        <div className={styles.acoesPerfil}>
          <button type="button" className={styles.botaoSecundario} onClick={cancelarEdicao}>
            <FiX />
            Cancelar
          </button>
          <button type="button" className={styles.botaoPrimario} onClick={salvarPerfil}>
            <FiSave />
            Salvar
          </button>
        </div>
      )
    }

    return (
      <div className={styles.acoesPerfil}>
        <button
          type="button"
          className={styles.botaoPrimario}
          onClick={() => {
            setNome(nomeExibido)
            setEditando(true)
          }}
        >
          <FiEdit2 />
          Editar perfil
        </button>
      </div>
    )
  }

  return (
    <div className={styles.pagina}>
      <section className={styles.conteudoPerfil}>
        <div className={styles.resumoPerfil}>
          <div className={styles.avatarContainer}>
            <img src={srcFoto} className={styles.avatar} alt="Foto de perfil" />
            <button
              type="button"
              className={styles.botaoFoto}
              onClick={abrirSeletorFoto}
              aria-label="Alterar foto de perfil"
            >
              <FiCamera />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={inputFoto}
              className={styles.inputFoto}
              onChange={aoEscolherFoto}
            />
          </div>

          <div className={styles.identidade}>
            <span className={styles.nomeResumo}>{nomeExibido}</span>
          </div>
        </div>

        {/* Campos principais do perfil, editaveis apenas no modo de edicao. */}
        <div className={styles.camposLista}>
          <div className={styles.campo}>
            <label>Nome</label>
            {renderizarCampoNome()}
            {mensagemPerfil && <span className={styles.mensagemSenha}>{mensagemPerfil}</span>}
          </div>

          <div className={styles.campo}>
            <label>Data de nascimento</label>
            {renderizarCampoNascimento()}
          </div>

          <div className={styles.campo}>
            <label>E-mail</label>
            <span className={styles.valorCampo}>{email}</span>
          </div>

          {!isGoogleUser && (
            <div className={styles.campo}>
              <label>Senha</label>
              {renderizarCampoSenha()}
            </div>
          )}
        </div>

        <div className={styles.rodapePerfil}>
          {renderizarAcoesPerfil()}

          <button type="button" className={styles.botaoSair} onClick={sairDaConta}>
            <FiLogOut />
            Sair da conta
          </button>

          <button type="button" className={styles.botaoSair} onClick={abrirExcluirConta}>
            Excluir conta
          </button>
        </div>
      </section>

      {confirmandoDelete && (
        <div className={styles.modalOverlay} onClick={cancelarExclusao}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-exclusao-conta"
          >
            <div className={styles.modalCabecalho}>
              <div className={styles.modalTituloGrupo}>
                <span className={styles.iconeAlerta}>
                  <FiAlertTriangle />
                </span>
                <div>
                  <span className={styles.kickerExclusao}>Exclusão permanente</span>
                  <h3 id="titulo-exclusao-conta" className={styles.modalTitulo}>Excluir conta?</h3>
                </div>
              </div>
              <button type="button" className={styles.botaoFecharModal} onClick={cancelarExclusao} aria-label="Fechar">
                <FiX />
              </button>
            </div>
            <form className={styles.formModal} onSubmit={excluirConta}>
              <p className={styles.textoConfirmacao}>
                Essa ação não pode ser desfeita. Seus dados de perfil serão removidos da aplicação.
              </p>

              {!isGoogleUser && (
                <div className={styles.grupoModal}>
                  <label className={styles.rotuloModal}>Senha atual</label>
                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    value={senhaDelete}
                    onChange={(e) => setSenhaDelete(e.target.value)}
                    className={styles.inputModal}
                    autoFocus
                    required
                  />
                </div>
              )}

              {mensagemDelete && (
                <span className={styles.mensagemModal} role="alert">
                  {mensagemDelete}
                </span>
              )}

              <div className={styles.modalAcoes}>
                <button type="button" className={styles.botaoCancelarModal} onClick={cancelarExclusao}>
                  Cancelar
                </button>

                <button type="submit" className={styles.botaoExcluirModal}>
                  Confirmar exclusão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
