// Aba de metas do grupo: resumo, carrossel de metas e registro de aportes.
import { useEffect, useRef, useState } from 'react'
import { FiAlertTriangle, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useMetas } from '../../../hooks/useMetas'
import GraficoAportes from '../../../components/GraficoAportes'
import IconeMeta from '../../../components/IconeMeta'
import ModalMeta from '../../../components/ModalMeta'
import ModalAporte from '../../../components/ModalAporte'
import styles from './Metas.module.css'

const MS_POR_DIA = 1000 * 60 * 60 * 24

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

function pluralizar(quantidade, singular, plural) {
  if (quantidade === 1) return singular
  return plural
}

function calcularPercentual(meta) {
  if (!meta.total) return 0
  return Math.min(100, Math.round((meta.alcancado / meta.total) * 100))
}

function obterDataPrazo(prazoData) {
  if (!prazoData) return null
  const [ano, mes] = prazoData.split('-').map(Number)
  if (!ano || !mes) return null
  // dia 0 do mês seguinte equivale ao último dia do mês atual
  return new Date(ano, mes, 0)
}

function calcularDiasRestantes(dataPrazo) {
  const hoje = new Date()
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const dias = Math.ceil((dataPrazo - inicioHoje) / MS_POR_DIA)
  return Math.max(0, dias)
}

// Calcula os valores exibidos nos cards de resumo da aba.
function calcularResumo(metas) {
  const totalGuardado = metas.reduce((total, meta) => total + meta.alcancado, 0)
  const progressoTotal = metas.reduce((total, meta) => total + calcularPercentual(meta), 0)
  const metasNoRitmo = metas.filter((meta) => meta.situacao === 'noRitmo').length

  let progressoMedio = 0
  if (metas.length) {
    progressoMedio = Math.round(progressoTotal / metas.length)
  }

  const proximaMeta = metas.reduce((maisProxima, meta) => {
    const dataPrazo = obterDataPrazo(meta.prazoData)
    if (!dataPrazo) return maisProxima
    if (!maisProxima || dataPrazo < maisProxima.dataPrazo) return { ...meta, dataPrazo }
    return maisProxima
  }, null)

  let diasProximoPrazo = 0
  if (proximaMeta) {
    diasProximoPrazo = calcularDiasRestantes(proximaMeta.dataPrazo)
  }

  return { totalGuardado, progressoMedio, metasNoRitmo, proximaMeta, diasProximoPrazo }
}

function buscarMembrosDaMeta(meta, membros) {
  return membros.filter((membro) => meta.membrosIds?.includes(membro.id))
}

function classeProgressoValor(meta) {
  if (meta.situacao === 'atencao') return `${styles.progressoValor} ${styles.progressoAtencao}`
  return styles.progressoValor
}

function classeBarraMeta(meta) {
  if (meta.situacao === 'atencao') return `${styles.barraPreenchida} ${styles.progressoAtencao}`
  return styles.barraPreenchida
}

// Texto do kicker acima do título no card de destaque.
function obterKickerMeta(meta) {
  if (meta.situacao === 'atencao') return 'Meta com atenção'
  if (meta.situacao === 'saudavel') return 'Meta saudável'
  return 'Meta em dia'
}

function obterTextoTagAporte(meta) {
  if (meta.situacao === 'noRitmo') return 'em dia'
  if (meta.situacao === 'saudavel') return 'saudável'
  return 'pendente'
}

function classeTagAporte(meta) {
  if (meta.situacao === 'noRitmo') return `${styles.tagAporte} ${styles.tagAporteEmDia}`
  if (meta.situacao === 'saudavel') return `${styles.tagAporte} ${styles.tagAporteSaudavel}`
  return styles.tagAporte
}

function obterTituloMovimentacao(mov) {
  if (mov.tipo === 'aporte') return `${mov.nomeMembro} registrou aporte`
  if (mov.tipo === 'ajuste') return `${mov.nomeMembro} ajustou a meta`
  if (mov.tipo === 'criacao') return `${mov.nomeMembro} criou uma meta`
  return mov.nomeMembro
}

// Gera descrição automática se a meta não tiver uma definida no backend.
function obterDescricaoMeta(meta, percentual) {
  if (meta.descricao) return meta.descricao
  const falta = formatarMoeda(meta.total - meta.alcancado)
  if (meta.situacao === 'atencao') {
    return `A meta está em ${percentual}% e precisa de atenção. Revise o aporte mensal para garantir que o prazo seja cumprido.`
  }
  if (meta.situacao === 'saudavel') {
    return `Boa consistência de aportes. Com o ritmo atual, a meta será concluída dentro do prazo previsto.`
  }
  return `${percentual}% concluído. Faltam ${falta} para atingir o objetivo.`
}

function idsIguais(idA, idB) {
  return idA != null && idB != null && String(idA) === String(idB)
}

export function Metas({ grupoId, metaInicialId = null }) {
  const {
    data,
    loading,
    error,
    criarMeta,
    atualizarMeta,
    deletarMeta,
    registrarAporte,
    atualizarAporte,
    usandoMock,
  } = useMetas(grupoId)
  const destaqueRef = useRef(null)

  // Guarda a meta escolhida para destacar o card e alimentar as próximas seções.
  const [metaSelecionadaId, setMetaSelecionadaId] = useState(metaInicialId)
  const [indiceCarrossel, setIndiceCarrossel] = useState(0)
  const [usuarioMoveuCarrossel, setUsuarioMoveuCarrossel] = useState(false)
  const [periodoAportes, setPeriodoAportes] = useState('6m')

  // Controla qual modal está aberto e qual meta está sendo manipulada.
  const [modalAberto, setModalAberto] = useState(null) // 'novaMeta' | 'editarMeta' | 'aporte'
  const [metaDoModal, setMetaDoModal] = useState(null)
  const [aporteDoModal, setAporteDoModal] = useState(null)
  const [metaConfirmacaoExclusao, setMetaConfirmacaoExclusao] = useState(null)
  const [erroOperacao, setErroOperacao] = useState('')
  const [erroAporte, setErroAporte] = useState('')
  const [metaExcluindoId, setMetaExcluindoId] = useState(null)

  useEffect(() => {
    if (metaInicialId && data?.metas?.length) {
      destaqueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [data?.metas?.length, metaInicialId])

  if (loading || !data) return <div className={styles.carregando}>Carregando...</div>

  const { metas, membros, movimentacoes } = data
  const mensagemErroCarregamento = error?.response?.data?.error || error?.message || ''

  function abrirNovaMeta() {
    setErroOperacao('')
    setErroAporte('')
    setModalAberto('novaMeta')
    setMetaDoModal(null)
  }

  function abrirEditarMeta(meta) {
    setErroOperacao('')
    setErroAporte('')
    setModalAberto('editarMeta')
    setMetaDoModal(meta)
  }

  function abrirAporte(meta = null) {
    setErroOperacao('')
    setErroAporte('')
    setModalAberto('aporte')
    setMetaDoModal(meta)
    setAporteDoModal(null)
  }

  function abrirEditarAporte(movimentacao) {
    const meta = metas.find((item) => idsIguais(item.id, movimentacao.metaId)) || null
    setErroOperacao('')
    setErroAporte('')
    setModalAberto('aporte')
    setMetaDoModal(meta)
    setAporteDoModal(movimentacao)
  }

  function fecharModal() {
    setModalAberto(null)
    setMetaDoModal(null)
    setAporteDoModal(null)
    setErroAporte('')
  }

  function abrirConfirmacaoExclusao(meta) {
    setErroOperacao('')

    if (usandoMock) {
      setErroOperacao('Endpoint de metas indisponível. Exibindo dados mockados.')
      return
    }

    setMetaConfirmacaoExclusao(meta)
  }

  function fecharConfirmacaoExclusao() {
    if (metaExcluindoId) return
    setMetaConfirmacaoExclusao(null)
  }

  async function handleSalvarMeta(meta) {
    setErroOperacao('')

    try {
      if (metaDoModal?.id) {
        await atualizarMeta(metaDoModal.id, meta)
      } else {
        await criarMeta(meta)
      }
      fecharModal()
    } catch (error) {
      setErroOperacao(error.response?.data?.error || 'Não foi possível salvar a meta.')
    }
  }

  async function handleSalvarAporte(aporte) {
    setErroOperacao('')
    setErroAporte('')

    try {
      if (aporteDoModal) {
        await atualizarAporte(aporte)
      } else {
        await registrarAporte(aporte)
      }
      fecharModal()
    } catch (error) {
      setErroAporte(error.response?.data?.error || 'Não foi possível salvar o aporte.')
    }
  }

  async function handleExcluirMeta() {
    setErroOperacao('')

    const meta = metaConfirmacaoExclusao
    if (!meta?.id) return

    setMetaExcluindoId(meta.id)

    try {
      await deletarMeta(meta.id)
      if (idsIguais(metaSelecionadaId, meta.id)) {
        setMetaSelecionadaId(null)
      }
      setMetaConfirmacaoExclusao(null)
      fecharModal()
    } catch (error) {
      setMetaConfirmacaoExclusao(null)
      setErroOperacao(error.response?.data?.error || 'Não foi possível excluir a meta.')
    } finally {
      setMetaExcluindoId(null)
    }
  }

  if (!metas.length) {
    return (
      <div className={styles.container}>
        {mensagemErroCarregamento && (
          <div className={styles.vazio}>Não foi possível carregar as metas: {mensagemErroCarregamento}</div>
        )}
        {erroOperacao && <div className={styles.vazio}>{erroOperacao}</div>}
        <div className={styles.vazio}>Nenhuma meta cadastrada.</div>
        <button type="button" className={styles.botaoPrimario} onClick={abrirNovaMeta}>
          Criar meta
        </button>

        {modalAberto === 'novaMeta' && (
          <ModalMeta
            meta={null}
            membros={membros}
            onSalvar={handleSalvarMeta}
            onFechar={fecharModal}
          />
        )}
      </div>
    )
  }

  const resumo = calcularResumo(metas)

  // Garante que sempre há uma meta selecionada válida, mesmo se a lista mudar.
  let metaSelecionadaIdAtual = metas[0].id
  if (metas.some((meta) => idsIguais(meta.id, metaSelecionadaId))) {
    metaSelecionadaIdAtual = metaSelecionadaId
  }

  const totalVisivel = 2
  const indiceMaximo = Math.max(0, metas.length - totalVisivel)
  const indiceMetaSelecionada = metas.findIndex((meta) => idsIguais(meta.id, metaSelecionadaIdAtual))

  let indiceCarrosselAtual = Math.min(indiceCarrossel, indiceMaximo)
  const metaSelecionadaForaDaJanela = indiceMetaSelecionada < indiceCarrossel ||
    indiceMetaSelecionada >= indiceCarrossel + totalVisivel
  if (metaInicialId && !usuarioMoveuCarrossel && metaSelecionadaForaDaJanela) {
    indiceCarrosselAtual = Math.min(indiceMetaSelecionada, indiceMaximo)
  }

  const podeVoltar = indiceCarrosselAtual > 0
  const podeAvancar = indiceCarrosselAtual < indiceMaximo
  const metasVisiveis = metas.slice(indiceCarrosselAtual, indiceCarrosselAtual + totalVisivel)

  const textoMetasAtivas = pluralizar(metas.length, 'meta ativa', 'metas ativas')
  const textoMembros = pluralizar(membros.length, 'membro', 'membros')
  const textoNoRitmo = pluralizar(resumo.metasNoRitmo, 'meta em dia', 'metas em dia')

  // Nome da meta com prazo mais próximo para o card de resumo.
  let nomeProximaMeta = 'Sem prazo definido'
  if (resumo.proximaMeta) {
    nomeProximaMeta = resumo.proximaMeta.nome
  }

  // Dados da meta atualmente selecionada para o card de destaque e painel de aporte.
  const metaSelecionada = metas.find((meta) => idsIguais(meta.id, metaSelecionadaIdAtual))
  const percentualSelecionada = calcularPercentual(metaSelecionada)

  // '—' como fallback até o backend retornar o campo aporteIdeal.
  let textoAporteIdeal = '—'
  if (metaSelecionada.aporteIdeal) {
    textoAporteIdeal = `${formatarMoeda(metaSelecionada.aporteIdeal)}/mês`
  }

  const percentualConfirmacaoExclusao = metaConfirmacaoExclusao
    ? calcularPercentual(metaConfirmacaoExclusao)
    : 0
  const membrosConfirmacaoExclusao = metaConfirmacaoExclusao
    ? buscarMembrosDaMeta(metaConfirmacaoExclusao, membros)
    : []
  const totalAportesConfirmacao = metaConfirmacaoExclusao?.raw?.contributions?.length ?? 0
  const textoAportesConfirmacao = pluralizar(
    totalAportesConfirmacao,
    'aporte registrado',
    'aportes registrados',
  )
  const excluindoMetaConfirmacao = idsIguais(metaExcluindoId, metaConfirmacaoExclusao?.id)

  // Fecha sobre metaSelecionadaIdAtual, por isso fica dentro do componente.
  function classeCardMeta(meta) {
    if (idsIguais(meta.id, metaSelecionadaIdAtual)) return `${styles.cardMeta} ${styles.cardMetaAtivo}`
    return styles.cardMeta
  }

  return (
    <div className={styles.container}>
      {mensagemErroCarregamento && (
        <div className={styles.vazio}>Não foi possível carregar as metas: {mensagemErroCarregamento}</div>
      )}
      {erroOperacao && <div className={styles.vazio}>{erroOperacao}</div>}

      {/* Cards de resumo da aba de metas */}
      <section className={styles.resumoGrid} aria-label="Resumo das metas">

        <article className={styles.cardResumo}>
          <span className={styles.rotulo}>Total guardado</span>
          <span className={`${styles.valor} ${styles.valorPositivo}`}>{formatarMoeda(resumo.totalGuardado)}</span>
          <span className={styles.detalhe}>em {metas.length} {textoMetasAtivas} com {membros.length} {textoMembros}</span>
        </article>

        <article className={styles.cardResumo}>
          <span className={styles.rotulo}>Progresso médio</span>
          <span className={styles.valor}>{resumo.progressoMedio}%</span>
          <span className={styles.detalhe}>{resumo.metasNoRitmo} {textoNoRitmo}</span>
        </article>

        <article className={styles.cardResumo}>
          <span className={styles.rotulo}>Próximo prazo</span>
          <span className={`${styles.valor} ${styles.valorPrimario}`}>{resumo.diasProximoPrazo} dias</span>
          <span className={styles.detalhe}>{nomeProximaMeta}</span>
        </article>

      </section>

      {/* Carrossel de metas */}
      <section className={styles.secaoMetas}>
        <div className={styles.cabecalhoSecao}>
          <span className={styles.tituloSecao}>Metas ativas</span>
        </div>

        <div className={styles.areaMetas}>
          <article
            className={styles.cardNovaMeta}
            onClick={abrirNovaMeta}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') abrirNovaMeta() }}
            aria-label="Criar nova meta"
          >
            <div className={styles.iconeNovaMeta}>+</div>
            <span className={styles.nomeNovaMeta}>Nova meta</span>
            <span className={styles.textoNovaMeta}>Defina um objetivo e acompanhe o progresso em grupo</span>
          </article>

          <div className={styles.carrosselMetas}>
            <button
              type="button"
              className={`${styles.setaCarrossel} ${styles.setaAnterior}`}
              onClick={() => {
                setUsuarioMoveuCarrossel(true)
                setIndiceCarrossel(indiceCarrosselAtual - 1)
              }}
              disabled={!podeVoltar}
              aria-label="Metas anteriores"
            >
              ‹
            </button>

            <div className={styles.listaMetas}>
              {metasVisiveis.map((meta) => {
                const percentual = calcularPercentual(meta)
                const membrosDaMeta = buscarMembrosDaMeta(meta, membros)
                const excluindoMeta = idsIguais(metaExcluindoId, meta.id)

                return (
                  // div com role="button" para permitir botões internos sem violar HTML semântico
                  <div
                    key={meta.id}
                    className={classeCardMeta(meta)}
                    onClick={() => setMetaSelecionadaId(meta.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMetaSelecionadaId(meta.id) }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={idsIguais(meta.id, metaSelecionadaIdAtual)}
                  >
                    <div className={styles.topoMeta}>
                      <div className={styles.blocoTituloMeta}>
                        <div className={styles.iconeMeta}>
                          <IconeMeta meta={meta} />
                        </div>
                        <div className={styles.infoMeta}>
                          <span className={styles.nomeMeta}>{meta.nome}</span>
                          <span className={styles.prazoMeta}>Prazo: {meta.prazo}</span>
                        </div>
                      </div>

                      <div className={styles.acoesMeta}>
                        <div className={styles.avataresMeta}>
                          {membrosDaMeta.map((membro) => (
                            <span
                              key={membro.id}
                              className={styles.avatarMeta}
                              style={{ backgroundColor: membro.cor }}
                              title={membro.nome}
                            >
                              {membro.iniciais}
                            </span>
                          ))}
                        </div>
                        {/* stopPropagation evita selecionar a meta ao clicar em editar */}
                        <button
                          type="button"
                          className={styles.botaoEditar}
                          onClick={(e) => { e.stopPropagation(); abrirEditarMeta(meta) }}
                          aria-label={`Editar meta ${meta.nome}`}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          type="button"
                          className={`${styles.botaoEditar} ${styles.botaoExcluir}`}
                          onClick={(e) => { e.stopPropagation(); abrirConfirmacaoExclusao(meta) }}
                          aria-label={`Excluir meta ${meta.nome}`}
                          disabled={excluindoMeta}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <div className={styles.progressoMeta}>
                      <div className={styles.progressoLinha}>
                        <span className={styles.progressoRotulo}>Progresso</span>
                        <span className={classeProgressoValor(meta)}>{percentual}%</span>
                      </div>
                      <div className={styles.barraMeta}>
                        <div className={classeBarraMeta(meta)} style={{ width: `${percentual}%` }} />
                      </div>
                    </div>

                    <div className={styles.valoresMeta}>
                      <div>
                        <span className={styles.valorRotulo}>Guardado</span>
                        <span className={styles.valorNumero}>{formatarMoeda(meta.alcancado)}</span>
                      </div>
                      <div className={styles.valorDireita}>
                        <span className={styles.valorRotulo}>Meta total</span>
                        <span className={styles.valorNumero}>{formatarMoeda(meta.total)}</span>
                      </div>
                    </div>

                    {/* stopPropagation evita selecionar a meta ao clicar em registrar aporte */}
                    <button
                      type="button"
                      className={styles.botaoAporte}
                      onClick={(e) => { e.stopPropagation(); abrirAporte(meta) }}
                    >
                      Registrar aporte
                    </button>
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              className={`${styles.setaCarrossel} ${styles.setaProxima}`}
              onClick={() => {
                setUsuarioMoveuCarrossel(true)
                setIndiceCarrossel(indiceCarrosselAtual + 1)
              }}
              disabled={!podeAvancar}
              aria-label="Próximas metas"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {/* Spotlight da meta selecionada + painel de próximo aporte */}
      <section className={styles.destaqueGrid} ref={destaqueRef}>

        <article className={styles.cardDestaque}>
          <div>
            <div className={styles.topoDestaque}>
              <div>
                <div className={styles.kickerMeta}>
                  <span className={styles.kickerPonto} />
                  <span>{obterKickerMeta(metaSelecionada)}</span>
                </div>
                <h2 className={styles.tituloDestaque}>{metaSelecionada.nome}</h2>
                <p className={styles.descricaoDestaque}>{obterDescricaoMeta(metaSelecionada, percentualSelecionada)}</p>
              </div>
              <div className={styles.acoesDestaque}>
                <button
                  type="button"
                  className={styles.botaoEditarDestaque}
                  onClick={() => abrirEditarMeta(metaSelecionada)}
                  aria-label={`Editar meta ${metaSelecionada.nome}`}
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  className={`${styles.botaoEditarDestaque} ${styles.botaoExcluirDestaque}`}
                  onClick={() => abrirConfirmacaoExclusao(metaSelecionada)}
                  aria-label={`Excluir meta ${metaSelecionada.nome}`}
                  disabled={idsIguais(metaExcluindoId, metaSelecionada.id)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <div className={styles.progressoMeta}>
              <div className={styles.progressoLinha}>
                <span className={styles.progressoRotulo}>Progresso</span>
                <span className={classeProgressoValor(metaSelecionada)}>{percentualSelecionada}%</span>
              </div>
              <div className={styles.barraMeta}>
                <div className={classeBarraMeta(metaSelecionada)} style={{ width: `${percentualSelecionada}%` }} />
              </div>
            </div>
          </div>

          {/* Mini-métricas: guardado, total e aporte ideal */}
          <div className={styles.miniMetricas}>
            <div className={styles.miniMetrica}>
              <span className={styles.miniRotulo}>Guardado</span>
              <span className={`${styles.miniValor} ${styles.valorPositivo}`}>
                {formatarMoeda(metaSelecionada.alcancado)}
              </span>
            </div>
            <div className={styles.miniMetrica}>
              <span className={styles.miniRotulo}>Meta total</span>
              <span className={styles.miniValor}>{formatarMoeda(metaSelecionada.total)}</span>
            </div>
            <div className={styles.miniMetrica}>
              <span className={styles.miniRotulo}>Aporte ideal</span>
              <span className={`${styles.miniValor} ${styles.valorAtencao}`}>
                {textoAporteIdeal}
              </span>
            </div>
          </div>
        </article>

        {/* Painel: próximo aporte da meta selecionada */}
        <aside className={styles.painelAporte}>
          <div className={styles.cabecalhoPainel}>
            <span className={styles.tituloSecao}>Próximo aporte da meta</span>
          </div>

          <div className={styles.cardProximoAporte}>
            <div className={styles.cabecalhoProximoAporte}>
              <span className={styles.nomeProximoAporte}>{metaSelecionada.nome}</span>
              <span className={classeTagAporte(metaSelecionada)}>
                {obterTextoTagAporte(metaSelecionada)}
              </span>
            </div>

            {/* Total combinado e divisão por membro */}
            <div className={styles.linhasAporte}>
              <div className={styles.linhaAporte}>
                <span>Valor combinado</span>
                <strong>{formatarMoeda(metaSelecionada.proximoAporte.valorTotal)}</strong>
              </div>
              {metaSelecionada.proximoAporte.porMembro.map((item) => {
                const membro = membros.find((m) => m.id === item.membroId)
                if (!membro) return null
                return (
                  <div key={item.membroId} className={styles.linhaAporte}>
                    <span>{membro.nome}</span>
                    <strong>{formatarMoeda(item.valor)}</strong>
                  </div>
                )
              })}
            </div>
          </div>

          <button type="button" className={styles.botaoPrimario} onClick={() => abrirAporte(metaSelecionada)}>
            Registrar aporte
          </button>
          <button type="button" className={styles.botaoSecundario} onClick={() => abrirEditarMeta(metaSelecionada)}>
            Ajustar divisão
          </button>
        </aside>

      </section>

      {/* Gráfico de evolução + movimentações recentes lado a lado */}
      <section className={styles.splitGrid}>

        <GraficoAportes
          evolucao={metaSelecionada.evolucaoAportes?.[periodoAportes] ?? null}
          totalPeriodo={metaSelecionada.estatisticasAportes?.[periodoAportes]?.total ?? 0}
          variacao={metaSelecionada.estatisticasAportes?.[periodoAportes]?.variacao ?? null}
          periodo={periodoAportes}
          onPeriodo={setPeriodoAportes}
        />

        <article className={styles.cardMovimentacoes}>
          <div className={styles.cabecalhoSecao}>
            <span className={styles.tituloSecao}>Movimentações recentes</span>
          </div>

          {movimentacoes.length === 0 ? (
            <div className={styles.vazio}>Nenhuma movimentação registrada.</div>
          ) : (
            <div className={styles.listaMovimentacoes}>
              {movimentacoes.map((mov) => {
                const membro = membros.find((m) => m.id === mov.membroId)
                return (
                  <div key={mov.id} className={styles.itemMovimentacao}>
                    <span
                      className={styles.avatarMovimentacao}
                      style={{ backgroundColor: membro?.cor ?? '#888' }}
                      title={mov.nomeMembro}
                    >
                      {membro?.iniciais ?? mov.nomeMembro[0]}
                    </span>

                    <div className={styles.infoMovimentacao}>
                      <span className={styles.tituloMovimentacao}>{obterTituloMovimentacao(mov)}</span>
                      <span className={styles.metaMovimentacao}>{mov.nomeMeta} · {mov.data}</span>
                    </div>

                    {mov.valor != null && (
                      <span className={styles.valorMovimentacao}>+{formatarMoeda(mov.valor)}</span>
                    )}
                    <button
                      type="button"
                      className={styles.botaoEditarMovimentacao}
                      onClick={() => abrirEditarAporte(mov)}
                      aria-label={`Editar aporte em ${mov.nomeMeta}`}
                    >
                      <FiEdit2 />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </article>

      </section>

      {/* Modais — renderizados fora do fluxo normal para sobrepor a página */}
      {(modalAberto === 'novaMeta' || modalAberto === 'editarMeta') && (
        <ModalMeta
          meta={modalAberto === 'editarMeta' ? metaDoModal : null}
          membros={membros}
          onSalvar={handleSalvarMeta}
          onFechar={fecharModal}
        />
      )}

      {modalAberto === 'aporte' && (
        <ModalAporte
          metas={metas}
          membros={membros}
          metaInicial={metaDoModal}
          aporteInicial={aporteDoModal}
          erro={erroAporte}
          onSalvar={handleSalvarAporte}
          onFechar={fecharModal}
        />
      )}

      {metaConfirmacaoExclusao && (
        <div className={styles.overlayConfirmacao} onClick={fecharConfirmacaoExclusao}>
          <div
            className={styles.modalConfirmacao}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmacao-exclusao"
          >
            <div className={styles.confirmacaoTopo}>
              <span className={styles.iconeAlerta}>
                <FiAlertTriangle />
              </span>
              <div>
                <span className={styles.kickerConfirmacao}>Exclusão permanente</span>
                <h2 id="titulo-confirmacao-exclusao" className={styles.tituloConfirmacao}>
                  Excluir meta?
                </h2>
              </div>
            </div>

            <p className={styles.textoConfirmacao}>
              Você está prestes a excluir esta meta do grupo. Todos os dados vinculados a ela
              serão perdidos.
            </p>

            <div className={styles.cardMetaConfirmacao}>
              <div className={styles.cabecalhoMetaConfirmacao}>
                <span className={styles.iconeMetaConfirmacao}>
                  <IconeMeta meta={metaConfirmacaoExclusao} />
                </span>
                <div className={styles.infoMetaConfirmacao}>
                  <strong>{metaConfirmacaoExclusao.nome}</strong>
                  <span>Prazo: {metaConfirmacaoExclusao.prazo}</span>
                </div>
              </div>

              <div className={styles.gradeDadosConfirmacao}>
                <div>
                  <span>Guardado</span>
                  <strong>{formatarMoeda(metaConfirmacaoExclusao.alcancado)}</strong>
                </div>
                <div>
                  <span>Meta total</span>
                  <strong>{formatarMoeda(metaConfirmacaoExclusao.total)}</strong>
                </div>
                <div>
                  <span>Progresso</span>
                  <strong>{percentualConfirmacaoExclusao}%</strong>
                </div>
              </div>

              <div className={styles.linhaConfirmacao}>
                <span>{totalAportesConfirmacao} {textoAportesConfirmacao}</span>
                <div className={styles.avataresConfirmacao}>
                  {membrosConfirmacaoExclusao.map((membro) => (
                    <span
                      key={membro.id}
                      className={styles.avatarMeta}
                      style={{ backgroundColor: membro.cor }}
                      title={membro.nome}
                    >
                      {membro.iniciais}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.alertaConfirmacao}>
              Esta ação não pode ser desfeita. Os aportes registrados nessa meta também serão
              removidos.
            </div>

            <div className={styles.rodapeConfirmacao}>
              <button
                type="button"
                className={styles.botaoCancelarConfirmacao}
                onClick={fecharConfirmacaoExclusao}
                disabled={excluindoMetaConfirmacao}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.botaoConfirmarExclusao}
                onClick={handleExcluirMeta}
                disabled={excluindoMetaConfirmacao}
              >
                {excluindoMetaConfirmacao ? 'Excluindo...' : 'Excluir meta'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
