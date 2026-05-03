// Aba de metas do grupo: resumo, carrossel de metas e registro de aportes.
import { useState } from 'react'
import { FiEdit2 } from 'react-icons/fi'
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

export function Metas({ metas = [], membros = [] }) {
  // Guarda a meta escolhida para destacar o card e alimentar as próximas seções.
  const [metaSelecionadaId, setMetaSelecionadaId] = useState(metas[0]?.id ?? null)
  const [indiceCarrossel, setIndiceCarrossel] = useState(0)

  if (!metas.length) {
    return (
      <div className={styles.container}>
        <div className={styles.vazio}>Nenhuma meta cadastrada.</div>
      </div>
    )
  }

  const resumo = calcularResumo(metas)

  // Garante que sempre há uma meta selecionada válida, mesmo se a lista mudar.
  let metaSelecionadaIdAtual = metas[0].id
  if (metas.some((meta) => meta.id === metaSelecionadaId)) {
    metaSelecionadaIdAtual = metaSelecionadaId
  }

  const totalVisivel = 2
  const indiceMaximo = Math.max(0, metas.length - totalVisivel)
  const podeVoltar = indiceCarrossel > 0
  const podeAvancar = indiceCarrossel < indiceMaximo
  const metasVisiveis = metas.slice(indiceCarrossel, indiceCarrossel + totalVisivel)

  const textoMetasAtivas = pluralizar(metas.length, 'meta ativa', 'metas ativas')
  const textoMembros = pluralizar(membros.length, 'membro', 'membros')
  const textoNoRitmo = pluralizar(resumo.metasNoRitmo, 'meta no ritmo', 'metas no ritmo')

  // Nome da meta com prazo mais próximo para o card de resumo.
  let nomeProximaMeta = 'Sem prazo definido'
  if (resumo.proximaMeta) {
    nomeProximaMeta = resumo.proximaMeta.nome
  }

  function classeCardMeta(meta) {
    if (meta.id === metaSelecionadaIdAtual) return `${styles.cardMeta} ${styles.cardMetaAtivo}`
    return styles.cardMeta
  }

  function classeProgressoValor(meta) {
    if (meta.situacao === 'atencao') return `${styles.progressoValor} ${styles.progressoAtencao}`
    return styles.progressoValor
  }

  function classeBarraMeta(meta) {
    if (meta.situacao === 'atencao') return `${styles.barraPreenchida} ${styles.progressoAtencao}`
    return styles.barraPreenchida
  }

  return (
    <div className={styles.container}>

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
          <article className={styles.cardNovaMeta}>
            <div className={styles.iconeNovaMeta}>+</div>
            <span className={styles.nomeNovaMeta}>Nova meta</span>
            <span className={styles.textoNovaMeta}>Defina um objetivo e acompanhe o progresso em grupo</span>
          </article>

          <div className={styles.carrosselMetas}>
            <button
              type="button"
              className={`${styles.setaCarrossel} ${styles.setaAnterior}`}
              onClick={() => setIndiceCarrossel(indiceCarrossel - 1)}
              disabled={!podeVoltar}
              aria-label="Metas anteriores"
            >
              ‹
            </button>

            <div className={styles.listaMetas}>
              {metasVisiveis.map((meta) => {
                const percentual = calcularPercentual(meta)
                const membrosDaMeta = buscarMembrosDaMeta(meta, membros)

                return (
                  // div com role="button" para permitir botões internos sem violar HTML semântico
                  <div
                    key={meta.id}
                    className={classeCardMeta(meta)}
                    onClick={() => setMetaSelecionadaId(meta.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMetaSelecionadaId(meta.id) }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={meta.id === metaSelecionadaIdAtual}
                  >
                    <div className={styles.topoMeta}>
                      <div className={styles.blocoTituloMeta}>
                        <div className={styles.iconeMeta}>{meta.emoji}</div>
                        <div className={styles.infoMeta}>
                          <span className={styles.nomeMeta}>{meta.nome}</span>
                          <span className={styles.prazoMeta}>{meta.prazo}</span>
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
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Editar meta ${meta.nome}`}
                        >
                          <FiEdit2 />
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
                      onClick={(e) => e.stopPropagation()}
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
              onClick={() => setIndiceCarrossel(indiceCarrossel + 1)}
              disabled={!podeAvancar}
              aria-label="Próximas metas"
            >
              ›
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
