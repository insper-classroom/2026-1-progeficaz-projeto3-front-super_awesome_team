// Pagina de perfil: exibe dados do usuario, edicao basica e acao de sair da conta.
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCamera, FiEdit2, FiLock, FiLogOut, FiSave, FiX } from 'react-icons/fi'
import styles from './Perfil.module.css'
import { useUser } from '../../hooks/useUser'

function obterTextoNascimento(nascimento) {
  if (nascimento) return nascimento
  return 'Nao informado'
}

export function Perfil() {
  const navigate = useNavigate()
  const { foto, setFoto } = useUser()
  const inputFoto = useRef(null)

  const [editando, setEditando] = useState(false)
  const [alterandoSenha, setAlterandoSenha] = useState(false)
  const [nome, setNome] = useState('Nome do usuario')
  const [nascimento, setNascimento] = useState('')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [mensagemSenha, setMensagemSenha] = useState('')

  const email = 'usuario@gmail.com'
  const textoNascimento = obterTextoNascimento(nascimento)

  let srcFoto = '/imagem_padrao_perfil.png'
  if (foto) {
    srcFoto = foto
  }

  function aoEscolherFoto(e) {
    const arquivo = e.target.files[0]
    if (!arquivo) return

    setFoto(URL.createObjectURL(arquivo))
  }

  function abrirSeletorFoto() {
    inputFoto.current.click()
  }

  function salvarPerfil() {
    // TODO: integrar com backend para atualizar os dados do usuario.
    setEditando(false)
  }

  function cancelarEdicao() {
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

  function salvarSenha() {
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

    // TODO: integrar com backend para validar a senha atual e salvar a nova senha.
    limparCamposSenha()
    setAlterandoSenha(false)
  }

  function sairDaConta() {
    // TODO: integrar com autenticacao real para limpar sessao/token.
    setFoto(null)
    navigate('/login')
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

    return <span className={styles.valorCampo}>{nome}</span>
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
        <button type="button" className={styles.botaoPrimario} onClick={() => setEditando(true)}>
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
            <span className={styles.nomeResumo}>{nome}</span>
          </div>
        </div>

        {/* Campos principais do perfil, editaveis apenas no modo de edicao. */}
        <div className={styles.camposLista}>
          <div className={styles.campo}>
            <label>Nome</label>
            {renderizarCampoNome()}
          </div>

          <div className={styles.campo}>
            <label>Data de nascimento</label>
            {renderizarCampoNascimento()}
          </div>

          <div className={styles.campo}>
            <label>E-mail</label>
            <span className={styles.valorCampo}>{email}</span>
          </div>

          <div className={styles.campo}>
            <label>Senha</label>
            {renderizarCampoSenha()}
          </div>
        </div>

        <div className={styles.rodapePerfil}>
          {renderizarAcoesPerfil()}

          <button type="button" className={styles.botaoSair} onClick={sairDaConta}>
            <FiLogOut />
            Sair da conta
          </button>
        </div>
      </section>
    </div>
  )
}
