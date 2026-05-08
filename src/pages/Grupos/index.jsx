import { useEffect, useRef, useState } from 'react'
import { FiPlus, FiTrash2, FiUpload, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import EstadoVazio from '../../components/EstadoVazio'
import GrupoCard from '../../components/GrupoCard'
import { useUser } from '../../hooks/useUser'
import {
  atualizarGrupo as atualizarGrupoApi,
  criarGrupo as criarGrupoApi,
  deletarGrupo as deletarGrupoApi,
  listarGrupos,
} from '../../services/groupService'
import { encodeImageToBase64 } from '../../utils/imageUtils'
import styles from './Grupos.module.css'

const IMAGEM_PADRAO = '/casa.jpg'

function obterDonoGrupo(grupo) {
  return grupo?.created_by || grupo?.criadoPor || grupo?.raw?.created_by || ''
}

function formatarDataCriacao(data) {
  if (!data) return 'Data de criação indisponível'

  const dataCriacao = new Date(data)
  if (Number.isNaN(dataCriacao.getTime())) return 'Data de criação indisponível'

  return `Criado em ${dataCriacao.toLocaleDateString('pt-BR')}`
}

function nomeDoEmail(email) {
  return email.split('@')[0]
}

function iniciaisDoNome(nome) {
  const partes = nome.trim().split(/\s+/)
  const iniciais = partes.length > 1 ? `${partes[0][0]}${partes[1][0]}` : nome.slice(0, 2)
  return iniciais.toUpperCase()
}

function mapearNomesMembros(membros) {
  return membros.reduce((mapa, membro) => {
    if (membro.email) {
      mapa[membro.email] = membro.nome || nomeDoEmail(membro.email)
    }
    return mapa
  }, {})
}

function mapearFotosMembros(membros) {
  return membros.reduce((mapa, membro) => {
    if (membro.email && membro.foto) {
      mapa[membro.email] = membro.foto
    }
    return mapa
  }, {})
}

export function Grupos() {
  const navigate = useNavigate()
  const inputUploadRef = useRef(null)
  const { usuario } = useUser()

  const [grupos, setGrupos] = useState([])
  const [modalAberto, setModalAberto] = useState(false)
  const [modoModal, setModoModal] = useState('create')
  const [grupoEditando, setGrupoEditando] = useState(null)
  const [nomeGrupo, setNomeGrupo] = useState('')
  const [emailMembro, setEmailMembro] = useState('')
  const [membros, setMembros] = useState([])
  const [nomesMembros, setNomesMembros] = useState({})
  const [fotosMembros, setFotosMembros] = useState({})
  const [imgSelecionada, setImgSelecionada] = useState(IMAGEM_PADRAO)
  const [imgUpload, setImgUpload] = useState(null)
  const [arquivoUpload, setArquivoUpload] = useState(null)
  const [novoDonoEmail, setNovoDonoEmail] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const imagens = [
    { src: '/casa.jpg', label: 'Casa' },
    { src: '/mercado.jpg', label: 'Mercado' },
    { src: '/estudo.jpg', label: 'Estudos' },
  ]

  const donoAtualEmail = obterDonoGrupo(grupoEditando)

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
    setMembros([])
    setNomesMembros({})
    setFotosMembros({})
    setEmailMembro('')
    setImgSelecionada(IMAGEM_PADRAO)
    setImgUpload(null)
    setArquivoUpload(null)
    setGrupoEditando(null)
    setNovoDonoEmail('')
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
    setMembros((grupo.membros || []).map((membro) => membro.email))
    setNomesMembros(mapearNomesMembros(grupo.membros || []))
    setFotosMembros(mapearFotosMembros(grupo.membros || []))
    setNovoDonoEmail(obterDonoGrupo(grupo))
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
      setNomesMembros((nomesAtuais) => ({
        ...nomesAtuais,
        [email]: nomeDoEmail(email),
      }))
      setFotosMembros((fotosAtuais) => ({
        ...fotosAtuais,
        [email]: null,
      }))
      setEmailMembro('')
    }
  }

  function removerMembro(emailParaRemover) {
    setMembros(membros.filter((email) => email !== emailParaRemover))
    setNomesMembros((nomesAtuais) => {
      const novosNomes = { ...nomesAtuais }
      delete novosNomes[emailParaRemover]
      return novosNomes
    })
    setFotosMembros((fotosAtuais) => {
      const novasFotos = { ...fotosAtuais }
      delete novasFotos[emailParaRemover]
      return novasFotos
    })
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
        imagem,
      }

      if (modoModal === 'edit' && novoDonoEmail && novoDonoEmail !== donoAtualEmail) {
        payload.created_by = novoDonoEmail
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

  async function deletarGrupo() {
    if (!grupoEditando) return

    const confirmar = window.confirm('Tem certeza que deseja excluir este grupo?')
    if (!confirmar) return

    try {
      await deletarGrupoApi(grupoEditando.id)
      await carregarGrupos()
      fecharModal()
    } catch {
      setErro('Não foi possível excluir o grupo.')
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

        {grupos.length > 0 ? (
          <div className={styles.grid}>
            {grupos.map((grupo) => (
              <GrupoCard
                key={grupo.id}
                id={grupo.id}
                title={grupo.nome}
                subtitle={formatarDataCriacao(grupo.criadoEm || grupo.desc)}
                image={grupo.imagem}
                onClick={() => navigate(`/grupos/${grupo.id}`)}
                onEdit={() => abrirEditarGrupo(grupo)}
              />
            ))}
          </div>
        ) : (
          !carregando && !erro && (
            <EstadoVazio
              classe={styles.estadoVazio}
              titulo="Nenhum grupo criado ainda"
              descricao="Crie seu primeiro grupo para organizar despesas, metas e aportes com outras pessoas."
              rotuloAcao="Criar grupo"
              aoAcionar={abrirCriarGrupo}
            />
          )
        )}
      </div>

      {modalAberto && (
        <div className={styles.overlay}>
          <form
            className={styles.modal}
            onSubmit={(e) => {
              e.preventDefault()
              salvarGrupo()
            }}
          >
            <div className={styles.cabecalho}>
              <h2 className={styles.titulo}>
                {modoModal === 'edit' ? 'Editar grupo' : 'Novo grupo'}
              </h2>
              <button
                type="button"
                className={styles.botaoFechar}
                onClick={fecharModal}
                aria-label="Fechar"
              >
                <FiX />
              </button>
            </div>

            <div className={styles.form}>
              {erro && <p className={styles.erro}>{erro}</p>}

              <div className={styles.grupo}>
                <label className={styles.rotulo} htmlFor="nome-grupo">
                  Nome do grupo
                </label>
                <input
                  id="nome-grupo"
                  className={styles.input}
                  type="text"
                  placeholder="Ex: Apartamento"
                  value={nomeGrupo}
                  onChange={(e) => setNomeGrupo(e.target.value)}
                />
              </div>

              <div className={styles.grupo}>
                <label className={styles.rotulo} htmlFor="email-membro">
                  Membros
                </label>
                <div className={styles.memberInputRow}>
                  <input
                    id="email-membro"
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
                  <button
                    type="button"
                    className={styles.botaoTexto}
                    onClick={adicionarMembro}
                  >
                    <FiPlus />
                    Adicionar
                  </button>
                </div>

                {membros.length > 0 && (
                  <div className={styles.membersList}>
                    {membros.map((email) => (
                      <div key={email} className={styles.memberRow}>
                        <span
                          className={`${styles.membroAvatar} ${
                            fotosMembros[email] ? styles.membroAvatarComFoto : ''
                          }`}
                        >
                          {fotosMembros[email] && (
                            <img
                              src={fotosMembros[email]}
                              alt={nomesMembros[email] || nomeDoEmail(email)}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          {iniciaisDoNome(nomesMembros[email] || nomeDoEmail(email))}
                        </span>
                        <div className={styles.membroInfo}>
                          <strong>{nomesMembros[email] || nomeDoEmail(email)}</strong>
                          <span>{email}</span>
                        </div>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removerMembro(email)}
                          aria-label={`Remover ${email}`}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {modoModal === 'edit' && donoAtualEmail === usuario?.email && (
                <div className={styles.grupo}>
                  <label className={styles.rotulo} htmlFor="novo-dono">
                    Transferir liderança
                  </label>
                  <select
                    id="novo-dono"
                    className={styles.input}
                    value={novoDonoEmail}
                    onChange={(e) => setNovoDonoEmail(e.target.value)}
                  >
                    <option value={donoAtualEmail}>Manter dono atual</option>
                    {membros
                      .filter((email) => email !== donoAtualEmail)
                      .map((email) => (
                        <option key={email} value={email}>
                          {email}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className={styles.grupo}>
                <span className={styles.rotulo}>Imagem do grupo</span>
                <div className={styles.imagensGrid}>
                  {imagens.map((img) => (
                    <button
                      key={img.src}
                      type="button"
                      className={
                        imgSelecionada === img.src
                          ? styles.imgSelecionada
                          : styles.imgOpcao
                      }
                      onClick={() => selecionarImagemPadrao(img.src)}
                      aria-label={`Selecionar imagem ${img.label}`}
                    >
                      <img src={img.src} alt={img.label} />
                    </button>
                  ))}

                  <button
                    type="button"
                    className={`${styles.uploadCard} ${
                      imgUpload ? styles.uploadCardAtivo : ''
                    }`}
                    onClick={() => inputUploadRef.current?.click()}
                  >
                    {imgUpload ? (
                      <img
                        src={imgUpload}
                        alt="Imagem enviada"
                        className={styles.uploadPrevia}
                      />
                    ) : (
                      <span className={styles.uploadPlaceholder}>
                        <FiUpload />
                        Upload
                      </span>
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
              </div>

              <div className={styles.rodape}>
                {modoModal === 'edit' && (
                  <button
                    type="button"
                    className={styles.botaoExcluir}
                    onClick={deletarGrupo}
                  >
                    Excluir grupo
                  </button>
                )}

                <div className={styles.acoesFormulario}>
                  <button
                    type="button"
                    className={styles.botaoCancelar}
                    onClick={fecharModal}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className={styles.botaoConfirmar}
                    disabled={!nomeGrupo.trim()}
                  >
                    {modoModal === 'edit' ? 'Salvar alterações' : 'Criar grupo'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
