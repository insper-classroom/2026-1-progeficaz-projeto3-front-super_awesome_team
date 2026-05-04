// Aba de visão geral do grupo: resumo financeiro, gráficos e metas.
import { useState } from 'react'
import { useVisaoGeral } from '../../../hooks/useVisaoGeral'
import CardsResumo from '../../../components/CardsResumo'
import GraficoGastos from '../../../components/GraficoGastos'
import InsightCard from '../../../components/InsightCard'
import CarouselMetas from '../../../components/CarouselMetas'
import SecaoCategorias from '../../../components/SecaoCategorias'
import styles from './VisaoGeral.module.css'

const periodos = [
  { valor: '7d',  rotulo: '7d'  },
  { valor: '30d', rotulo: 'Mês' },
  { valor: '3m',  rotulo: '3m'  },
  { valor: '6m',  rotulo: '6m'  },
  { valor: '1a',  rotulo: '1a'  },
]

export function VisaoGeral({ grupoId, onVerMetas, onVerDespesas }) {
  const [periodo, setPeriodo] = useState('30d')
  const { data, loading, error } = useVisaoGeral(grupoId, periodo)

  function classePeriodo(valor) {
    if (periodo === valor) return `${styles.btnPeriodo} ${styles.btnPeriodoAtivo}`
    return styles.btnPeriodo
  }

  if (loading) return <div className={styles.carregando}>Carregando...</div>
  if (error) return <div className={styles.carregando}>Não foi possível carregar a visão geral.</div>
  if (!data) return <div className={styles.carregando}>Nenhum dado disponível.</div>

  return (
    <div className={styles.container}>

      {/* Cards de resumo: total gasto e saldo */}
      <CardsResumo
        totalAtual={data.totalAtual}
        totalAnterior={data.totalAnterior}
        voceDeVe={data.voceDeVe}
        periodo={periodo}
      />

      {/* Carrossel de metas do grupo */}
      <CarouselMetas metas={data.metas} onVerMetas={onVerMetas} />

      {/* Cabeçalho da seção de análise com filtro de período na direita */}
      <div className={styles.cabecalhoAnalise}>
        <span className={styles.tituloSecao}>Análise</span>
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
      </div>

      {/* Insight e gráfico lado a lado */}
      <div className={styles.linhaAnalise}>
        <InsightCard
          totalAtual={data.totalAtual}
          totalAnterior={data.totalAnterior}
          categorias={data.categorias}
          periodo={periodo}
        />
        <GraficoGastos
          evolucao={data.evolucao}
          totalAtual={data.totalAtual}
          totalAnterior={data.totalAnterior}
          periodo={periodo}
        />
      </div>

      {/* Card de categorias: donut + tabela comparativa, hover no donut mostra % */}
      <SecaoCategorias
        categorias={data.categorias}
        categoriasPrev={data.categoriasPrev}
        onVerMais={onVerDespesas}
      />

    </div>
  )
}
