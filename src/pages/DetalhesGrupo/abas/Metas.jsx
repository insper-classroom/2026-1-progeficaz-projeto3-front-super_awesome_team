import styles from './Metas.module.css'

const MS_POR_DIA = 1000 * 60 * 60 * 24

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

function pluralizar(quantidade, singular, plural) {
  return quantidade === 1 ? singular : plural
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

function calcularResumo(metas) {
  const totalGuardado = metas.reduce((total, meta) => total + meta.alcancado, 0)
  const progressoTotal = metas.reduce((total, meta) => total + calcularPercentual(meta), 0)
  const progressoMedio = metas.length ? Math.round(progressoTotal / metas.length) : 0
  const metasNoRitmo = metas.filter((meta) => meta.situacao === 'noRitmo').length

  const proximaMeta = metas.reduce((maisProxima, meta) => {
    const dataPrazo = obterDataPrazo(meta.prazoData)
    if (!dataPrazo) return maisProxima
    if (!maisProxima || dataPrazo < maisProxima.dataPrazo) return { ...meta, dataPrazo }
    return maisProxima
  }, null)

  return {
    totalGuardado,
    progressoMedio,
    metasNoRitmo,
    proximaMeta,
    diasProximoPrazo: proximaMeta ? calcularDiasRestantes(proximaMeta.dataPrazo) : 0,
  }
}

export function Metas({ metas = [], membros = [] }) {
  if (!metas.length) {
    return (
      <div className={styles.container}>
        <div className={styles.vazio}>Nenhuma meta cadastrada.</div>
      </div>
    )
  }

  const resumo = calcularResumo(metas)
  const textoMetasAtivas = pluralizar(metas.length, 'meta ativa', 'metas ativas')
  const textoMembros = pluralizar(membros.length, 'membro', 'membros')
  const textoNoRitmo = pluralizar(resumo.metasNoRitmo, 'meta no ritmo', 'metas no ritmo')

  return (
    <div className={styles.container}>
      <section className={styles.resumoGrid} aria-label="Resumo das metas">

        <article className={styles.cardResumo}>
          <span className={styles.rotulo}>Total guardado</span>
          <span className={`${styles.valor} ${styles.valorPositivo}`}>{formatarMoeda(resumo.totalGuardado)}</span>
          <span className={styles.detalhe}>
            em {metas.length} {textoMetasAtivas} com {membros.length} {textoMembros}
          </span>
        </article>

        <article className={styles.cardResumo}>
          <span className={styles.rotulo}>Progresso médio</span>
          <span className={styles.valor}>{resumo.progressoMedio}%</span>
          <span className={styles.detalhe}>{resumo.metasNoRitmo} {textoNoRitmo}</span>
        </article>

        <article className={styles.cardResumo}>
          <span className={styles.rotulo}>Próximo prazo</span>
          <span className={`${styles.valor} ${styles.valorPrimario}`}>{resumo.diasProximoPrazo} dias</span>
          <span className={styles.detalhe}>{resumo.proximaMeta?.nome ?? 'Sem prazo definido'}</span>
        </article>

      </section>
    </div>
  )
}
