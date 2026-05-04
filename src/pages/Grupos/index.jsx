import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import GrupoCard from '../../components/GrupoCard'
import {
  atualizarGrupo as atualizarGrupoApi,
  criarGrupo as criarGrupoApi,
  listarGrupos,
} from '../../services/groupService'
import { encodeImageToBase64 } from '../../utils/imageUtils'
import styles from './Grupos.module.css'

const IMAGEM_PADRAO = '/casa.jpg'

export function Grupos() {
  const navigate = useNavigate()
  const inputUploadRef = useRef(null)

  const [grupos, setGrupos] = useState([])
  const [modalAberto, setModalAberto] = useState(false)
  const [modoModal, setModoModal] = useState('create')
  const [grupoEditando, setGrupoEditando] = useState(null)
  const [nomeGrupo, setNomeGrupo] = useState('')
  const [descricaoGrupo, setDescricaoGrupo] = useState('')
  const [emailMembro, setEmailMembro] = useState('')
  const [membros, setMembros] = useState([])
  const [imgSelecionada, setImgSelecionada] = useState(IMAGEM_PADRAO)
  const [imgUpload, setImgUpload] = useState(null)
  const [arquivoUpload, setArquivoUpload] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const imagens = [
    { src: '/casa.jpg', label: 'Casa' },
    { src: '/mercado.jpg', label: 'Mercado' },
    { src: '/estudo.jpg', label: 'Estudos' },
  ]

  async function carregarGrupos() {
    setCarregando(true)
    setErro('')

    try {
      const gruposCarregados = await listarGrupos()
      setGrupos(gruposCarregados)
    } catch {
      setErro('Não foi possível carregar seus grupos.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(carregarGrupos)
  }, [])

  function limparFormulario() {
    setNomeGrupo('')
    setDescricaoGrupo('')
    setMembros([])
    setEmailMembro('')
    setImgSelecionada(IMAGEM_PADRAO)
    setImgUpload(null)
    setArquivoUpload(null)
    setGrupoEditando(null)
  }

  function abrirCriarGrupo() {
    setModoModal('create')
    setErro('')
    limparFormulario()
    setModalAberto(true)
  }

  function abrirEditarGrupo(grupo) {
    setModoModal('edit')
    setErro('')
    setGrupoEditando(grupo)
    setNomeGrupo(grupo.nome || '')
    setDescricaoGrupo(grupo.descricao || '')
    setMembros((grupo.membros || []).map((membro) => membro.email))
    setEmailMembro('')
    setImgSelecionada(grupo.imagem || IMAGEM_PADRAO)
    setImgUpload(null)
    setArquivoUpload(null)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setModoModal('create')
    setErro('')
    limparFormulario()
  }

  function adicionarMembro() {
    const email = emailMembro.trim().toLowerCase()

    if (email && !membros.includes(email)) {
      setMembros([...membros, email])
      setEmailMembro('')
    }
  }

  function removerMembro(emailParaRemover) {
    setMembros(membros.filter((email) => email !== emailParaRemover))
  }

  function selecionarImagemPadrao(src) {
    setImgSelecionada(src)
    setImgUpload(null)
    setArquivoUpload(null)
  }

  function handleUpload(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    const url = URL.createObjectURL(arquivo)
    setImgUpload(url)
    setImgSelecionada(url)
    setArquivoUpload(arquivo)
  }

  async function salvarGrupo() {
    if (!nomeGrupo.trim()) return

    setErro('')

    try {
      const imagem = arquivoUpload
        ? await encodeImageToBase64(arquivoUpload)
        : imgSelecionada

      const payload = {
        nome: nomeGrupo.trim(),
        membros,
        descricao: descricaoGrupo.trim() || 'Novo grupo',
        imagem,
      }

      if (modoModal === 'edit' && grupoEditando) {
        await atualizarGrupoApi(grupoEditando.id, payload)
      } else {
        await criarGrupoApi(payload)
      }

      await carregarGrupos()
      fecharModal()
    } catch (error) {
      setErro(error.response?.data?.error || 'Não foi possível salvar o grupo.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1>Meus Grupos</h1>
            <p>Organize suas despesas em grupo</p>
          </div>

          <Button onClick={abrirCriarGrupo}>Criar grupo</Button>
        </div>

        {carregando && <p>Carregando grupos...</p>}
        {erro && !modalAberto && <p>{erro}</p>}

        <div className={styles.grid}>
          {grupos.map((grupo) => (
            <GrupoCard
              key={grupo.id}
              id={grupo.id}
              title={grupo.nome}
              subtitle={grupo.desc}
              image={grupo.imagem}
              onClick={() => navigate(`/grupos/${grupo.id}`)}
              onEdit={() => abrirEditarGrupo(grupo)}
            />
          ))}
        </div>
      </div>

      {modalAberto && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>
              {modoModal === 'edit' ? 'Editar grupo' : 'Novo grupo'}
            </h2>

            {erro && <p className={styles.erro}>{erro}</p>}

            <input
              className={styles.input}
              type="text"
              placeholder="Nome do grupo"
              value={nomeGrupo}
              onChange={(e) => setNomeGrupo(e.target.value)}
            />

            <textarea
              className={styles.input}
              placeholder="Descrição do grupo"
              value={descricaoGrupo}
              onChange={(e) => setDescricaoGrupo(e.target.value)}
              rows={3}
            />

            <div className={styles.sectionHeader}>
              <h4>Membros</h4>
            </div>

            <div className={styles.memberInputRow}>
              <input
                className={styles.input}
                type="email"
                placeholder="E-mail do membro"
                value={emailMembro}
                onChange={(e) => setEmailMembro(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    adicionarMembro()
                  }
                }}
              />
              <Button onClick={adicionarMembro}>Adicionar</Button>
            </div>

            <div className={styles.membersList}>
              {membros.map((email) => (
                <div key={email} className={styles.memberRow}>
                  <span>{email}</span>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removerMembro(email)}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.sectionHeader}>
              <h4>Imagem do grupo</h4>
            </div>

            <div className={styles.imagensGrid}>
              {imagens.map((img) => (
                <button
                  key={img.src}
                  type="button"
                  className={
                    imgSelecionada === img.src ? styles.imgSelecionada : styles.imgOpcao
                  }
                  onClick={() => selecionarImagemPadrao(img.src)}
                >
                  <img src={img.src} alt={img.label} />
                  <span>{img.label}</span>
                </button>
              ))}

              <button
                type="button"
                className={styles.uploadCard}
                onClick={() => inputUploadRef.current?.click()}
              >
                {imgUpload ? (
                  <img
                    src={imgUpload}
                    alt="Imagem enviada"
                    className={styles.uploadPrevia}
                  />
                ) : (
                  <span>+ Upload</span>
                )}
              </button>

              <input
                ref={inputUploadRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className={styles.uploadInput}
              />
            </div>

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={fecharModal}>
                Cancelar
              </Button>

              <Button onClick={salvarGrupo}>
                {modoModal === 'edit' ? 'Salvar alterações' : 'Criar grupo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
