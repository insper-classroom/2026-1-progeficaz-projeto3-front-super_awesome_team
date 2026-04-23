// Página de listagem de grupos do usuário
import { useState } from 'react'

export function Grupos() {

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

    return (
        <div>
            <h1>Meus Grupos</h1>

            <button onClick={() => setModalAberto(true)}>Criar grupo</button>
            {/* lista de grupos — por enquanto vazia */}
            <div>
                <p>Nenhum grupo ainda.</p>
            </div>

            {/* modal de criar grupo — aparece quando modalAberto for true */}
            {modalAberto && (
                <div>
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

                <button>Criar</button>
                <button onClick={() => fecharModal()}>Fechar</button>
                </div>
            )}

        </div>
    )
}