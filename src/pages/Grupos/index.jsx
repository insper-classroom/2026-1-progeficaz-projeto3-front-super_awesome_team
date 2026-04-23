// Página de listagem de grupos do usuário
import { useState } from 'react'
import styles from './Grupos.module.css'
import { useNavigate } from 'react-router-dom'

export function Grupos() {

    const navigate = useNavigate() // hook para navegar entre páginas
    const [grupos, setGrupos] = useState([]) // lista de grupos criados pelo usuario
    const [modalAberto, setModalAberto] = useState(false) // controla a visibilidade do modal
    const [nomeGrupo, setNomeGrupo] = useState('') // nome digitado para o novo grupo
    const [emailMembro, setEmailMembro ] = useState('') // e-mail digitado para adicionar membro
    const [membros, setMembros] = useState([]) // lista de e-mails dos membros adicionados

    // adiciona e-mail à lista, bloqueando duplicados
    function adicionarMembro() {
      if (!membros.includes(emailMembro)) { 
        setMembros([...membros, emailMembro]);
        setEmailMembro('') // limpa o campo após adicionar
        console.log('E-mail adicionado');
      } else {
        console.log('Este membro já foi adicionado a lista');
      }

    }

    // fecha o modal e limpa os campos do formulário
    function fecharModal() {
      setModalAberto(false);
      setNomeGrupo('');
      setMembros([])
    }

    // cria grupo
    function criarGrupo() {
      if (!nomeGrupo) return 
      const novoGrupo = { id: Date.now(), nome: nomeGrupo, membros }
      //adiciona o novo grupoa lista e fecha modal
      setGrupos([...grupos, novoGrupo])
      fecharModal()
    }

    return (
        <div className={styles.pagina}>
            <h1>Meus Grupos</h1>

            <button onClick={() => setModalAberto(true)}>Criar grupo</button>
            {/* lista de grupos criados — cada card navega para o dashboard do grupo*/}
            
            <div>
                {grupos.map((grupo) => (
                    <div key={grupo.id} onClick={() => navigate(`/grupos/${grupo.id}`)}>
                      {grupo.nome}
                    </div>
                  ))}
            </div>
            
            {/* modal de criar grupo — aparece quando modalAberto for true */}
            {modalAberto && (
                <div className={styles.modal}>
                <h2>Novo grupo</h2>

                {/* campo nome do grupo */}
                <input 
                  type="text"
                  placeholder="Nome do grupo"
                  value={nomeGrupo}
                  onChange={(e) => setNomeGrupo(e.target.value)} 
                />

                {/* campo adicionar membro por e-mail */}
                <input 
                  type="email"
                  placeholder="E-mail do membro"
                  value={emailMembro}
                  onChange={(e) => setEmailMembro(e.target.value)} // 'e' é o evento, 'e.target.value' é o texto digitado
                />
                <button onClick={() => adicionarMembro()}>Adicionar membro</button>

                {/* lista de membros adicionados */}
                <ul>
                  {/* .map percorre a lista de membros e renderiza um <li> para cada e-mail */}
                  {membros.map((email, index) => (
                    <li key={index}>{email}</li>
                  ))}
                </ul>

                <button className={styles.botaoCriar} onClick={criarGrupo}>Criar</button>
                <button onClick={() => fecharModal()}>Fechar</button>
                </div>
            )}

        </div>
    )
}