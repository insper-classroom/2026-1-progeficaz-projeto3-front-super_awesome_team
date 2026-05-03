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

  // Dados da meta atualmente selecionada para o card de destaque e painel de aporte.
  const metaSelecionada = metas.find((meta) => meta.id === metaSelecionadaIdAtual)
  const percentualSelecionada = calcularPercentual(metaSelecionada)
  const membrosDaSelecionada = buscarMembrosDaMeta(metaSelecionada, membros)

  let textoAporteIdeal = '—'
  if (metaSelecionada.aporteIdeal) {
    textoAporteIdeal = `${formatarMoeda(metaSelecionada.aporteIdeal)}/mês`
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

  // Texto do kicker acima do título no card de destaque.
  function obterKickerMeta(meta) {
    if (meta.situacao === 'atencao') return 'Meta com atenção'
    if (meta.situacao === 'saudavel') return 'Meta saudável'
    return 'Meta no ritmo'
  }

  // Gera descrição automática se a meta não tiver uma definida.
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

      {/* Spotlight da meta selecionada + painel de próximo aporte */}
      <section className={styles.destaqueGrid}>

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
              <button
                type="button"
                className={styles.botaoEditarDestaque}
                aria-label={`Editar meta ${metaSelecionada.nome}`}
              >
                <FiEdit2 />
              </button>
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
              <span className={styles.tagAporte}>pendente</span>
            </div>

            {/* Divisão do aporte entre os membros da meta */}
            <div className={styles.linhasAporte}>
              {membrosDaSelecionada.map((membro) => {
                let valorAporte = '—'
                if (membro.aporte) {
                  valorAporte = formatarMoeda(membro.aporte)
                }
                return (
                  <div key={membro.id} className={styles.linhaAporte}>
                    <span>{membro.nome}</span>
                    <strong>{valorAporte}</strong>
                  </div>
                )
              })}
            </div>
          </div>

          <button type="button" className={styles.botaoPrimario}>Registrar aporte</button>
          <button type="button" className={styles.botaoSecundario}>Ajustar divisão</button>
        </aside>

      </section>

    </div>
  )
}
