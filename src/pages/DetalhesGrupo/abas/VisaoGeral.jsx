// Aba de visão geral do grupo: resumo financeiro, gráficos e metas.
import { useState } from 'react'
import { useVisaoGeral } from '../../../hooks/useVisaoGeral'
import CardsResumo from '../../../components/CardsResumo'
import styles from './VisaoGeral.module.css'

// Opções de período disponíveis no filtro
const periodos = [
  { valor: '7d',  rotulo: '7 dias' },
  { valor: '30d', rotulo: '30 dias' },
  { valor: '3m',  rotulo: '3 meses' },
  { valor: '6m',  rotulo: '6 meses' },
  { valor: '1a',  rotulo: '1 ano' },
]

export function VisaoGeral({ grupoId }) {
  // período selecionado no filtro (padrão: 30 dias)
  const [periodo, setPeriodo] = useState('30d')

  // busca os dados do grupo conforme o período
  const { data, loading } = useVisaoGeral(grupoId, periodo)

  // estilo do botão de período (ativo ou não)
  function classePeriodo(valor) {
    if (periodo === valor) return `${styles.btnPeriodo} ${styles.btnPeriodoAtivo}`
    return styles.btnPeriodo
  }

  if (loading || !data) return <div className={styles.carregando}>Carregando...</div>

  return (
    <div className={styles.container}>

      {/* Filtro de período */}
      <div className={styles.filtroPeriodo}>
        {periodos.map((p) => (
          <button
            key={p.valor}
            className={classePeriodo(p.valor)}
            onClick={() => setPeriodo(p.valor)}
          >
            {p.rotulo}
          </button>
        ))}
      </div>

      {/* Cards de resumo: total, variação e saldo */}
      <CardsResumo
        totalAtual={data.totalAtual}
        totalAnterior={data.totalAnterior}
        voceDeVe={data.voceDeVe}
      />

    </div>
  )
}
