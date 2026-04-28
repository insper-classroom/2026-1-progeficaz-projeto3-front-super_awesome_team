// Página com dados pessoais do usuário
import styles from './Perfil.module.css'
import { useState, useRef } from "react"
import { CiEdit } from 'react-icons/ci'
import { useUser } from '../../contexts/UserContext'

export function Perfil() {

  const [editando, setEditando] = useState(false) // controla modo de edicao
  const [nome, setNome] = useState('Nome do usuário') // dados mockados por enquanto
  const [nascimento, setNascimento] = useState('')
  const [senha, setSenha] = useState('••••••••')
  const email = 'usuario@gmail.com'
  const { foto, setFoto } = useUser() // foto de perfil compartilhada via contexto
  const inputFoto = useRef(null) // referência ao input de arquivo escondido


  // renderiza o campo nome — input se editando, texto se não
  function renderizaNome() {
    if (editando) {
      return <input value={nome} onChange={(e) => setNome(e.target.value)} />
    }
    return <p>{nome}</p>
  }

  function renderizaNascimento() {
    if (editando) {
      return <input type="date" value={nascimento} onChange={(e) => setNascimento(e.target.value)}/>
    }
    return <p>{nascimento}</p>
  }

  // renderiza o campo senha — input se editando, texto se não
  function renderizaSenha() {
    if (editando) {
      return <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
    }
    return <p>{senha}</p>
  }

  function aoEscolherFoto(e) {
    const arquivo = e.target.files[0]
    if (arquivo) {
      setFoto(URL.createObjectURL(arquivo)) // cria URL temporária para preview
    }
  }

  // renderiza o botão — salvar se editando, editar se não
  function renderizaBotao() {
    if (editando) {
      return <button onClick={() => setEditando(false)}>Salvar</button>
    }
    return <button onClick={() => setEditando(true)}>Editar</button>
  }
    return (
      <div className={styles.pagina}>
        {/* container da foto com lápis por cima */}
        <div className={styles.avatarContainer}>

          {/* mostra foto escolhida ou foto padrão */}
          <img src={foto || '/imagem_padrao_perfil.png'} className={styles.avatar} />

          {/* lápis clicável que abre o seletor de arquivo */}
          <div className={styles.editarFoto} onClick={() => inputFoto.current.click()}>
            <CiEdit />
          </div>

          {/* input escondido */}
          <input
            type="file"
            accept="image/*"
            ref={inputFoto}
            style={{ display: 'none' }}
            onChange={aoEscolherFoto}
          />
        </div>

        <p className={styles.label}>Nome:</p>
        {renderizaNome()}

        <p>Data de nascimento</p>
        <p>{renderizaNascimento()}</p>

        <p>E-mail:</p>
        <p>{email}</p>

        <p>Senha:</p>
        {renderizaSenha()}

        {renderizaBotao()}
      </div>
    )

  }

