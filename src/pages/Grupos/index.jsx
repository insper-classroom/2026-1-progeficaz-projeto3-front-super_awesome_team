// Página de listagem de grupos do usuário
import { useState } from 'react'
import styles from './Grupos.module.css'
import { useNavigate } from 'react-router-dom'
import GrupoCard from '../../components/GrupoCard'
import Button from '../../components/Button'

export function Grupos() {

    const navigate = useNavigate() // hook para navegar entre páginas
    const [grupos, setGrupos] = useState([]) // lista de grupos criados pelo usuario
    const [modalAberto, setModalAberto] = useState(false) // controla a visibilidade do modal
    const [nomeGrupo, setNomeGrupo] = useState('') // nome digitado para o novo grupo
    const [emailMembro, setEmailMembro ] = useState('') // e-mail digitado para adicionar membro
    const [membros, setMembros] = useState([]) // lista de e-mails dos membros adicionados
    const [imgSelecionada, setImgSelecionada] = useState('/casa.jpg') // imagem escolhida para o grupo

    const imagens = [
      { src: '/casa.jpg', label: 'Casa' },
      { src: '/viagem.jpg', label: 'Viagem' },
      { src: '/mercado.jpg', label: 'Mercado' },
      { src: '/estudo.jpg', label: 'Estudos' },
    ]

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
      setModalAberto(false)
      setNomeGrupo('')
      setMembros([])
      setImgSelecionada('/casa.jpg')
    }

    // cria grupo
    function criarGrupo() {
      if (!nomeGrupo) return
      const novoGrupo = { id: Date.now(), nome: nomeGrupo, membros, img: imgSelecionada, desc: 'Novo grupo', valor: 'R$ 0' }
      setGrupos([...grupos, novoGrupo])
      fecharModal()
    }

    return (
        <div className={styles.pagina}>
            <div className={styles.header}>
                <div>
                    <h1>Meus Grupos</h1>
                    <p>Organize suas despesas em grupo</p>
                </div>
                <Button onClick={() => setModalAberto(true)}>Criar grupo</Button>
            </div>
            {/* lista de grupos criados — cada card navega para o dashboard do grupo*/}

            <div className={styles.grid}>
                {grupos.map((grupo) => (
                    <GrupoCard
                      key={grupo.id}
                      title={grupo.nome}
                      subtitle={grupo.desc}
                      image={grupo.img}
                      onClick={() => navigate(`/grupos/${grupo.id}`)}
                    />
                  ))}
            </div>
            
            {/* modal de criar grupo — aparece quando modalAberto for true */}
            {modalAberto && (
                <div className={styles.overlay}>
                <div className={styles.modal}>
                <h2 className={styles.modalTitle}>Novo grupo</h2>

                {/* campo nome do grupo */}
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Nome do grupo"
                  value={nomeGrupo}
                  onChange={(e) => setNomeGrupo(e.target.value)}
                />

                {/* campo adicionar membro por e-mail */}
                <input
                  className={styles.input}
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

                {/* seleção de imagem */}
                <p>Escolha uma imagem:</p>
                <div className={styles.imagensGrid}>
                  {imagens.map((img) => (
                    <img
                      key={img.src}
                      src={img.src}
                      alt={img.label}
                      className={imgSelecionada === img.src ? styles.imgSelecionada : styles.imgOpcao}
                      onClick={() => setImgSelecionada(img.src)}
                    />
                  ))}
                </div>

                <div className={styles.modalActions}>
                  <button className={styles.secondary} onClick={fecharModal}>Fechar</button>
                  <button className={styles.primary} onClick={criarGrupo}>Criar</button>
                </div>
                </div>
                </div>
            )}

        </div>
    )
}