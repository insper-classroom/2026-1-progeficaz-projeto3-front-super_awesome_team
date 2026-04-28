// Página com dados pessoais do usuário
import styles from './Perfil.module.css'
import { useState } from "react"

export function Perfil() {

  const [editando, setEditando] = useState(false) // controla modo de edicao
  const [nome, setNome] = useState('Nome do usuário') // dados mockados por enquanto
  const [nascimento, setNascimento] = useState('')
  const [senha, setSenha] = useState('••••••••')
  const email = 'usuario@gmail.com'

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

  // renderiza o botão — salvar se editando, editar se não
  function renderizaBotao() {
    if (editando) {
      return <button onClick={() => setEditando(false)}>Salvar</button>
    }
    return <button onClick={() => setEditando(true)}>Editar</button>
  }
    return (
      <div className={styles.pagina}>
        <div className={styles.avatar}>👤</div>

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

