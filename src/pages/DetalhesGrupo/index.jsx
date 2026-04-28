// Página detalhada do grupo (dashboard compartilhado entre membros)
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { VisaoGeral } from './abas/VisaoGeral'
import { Despesas } from './abas/Despesas'
import { Metas } from './abas/Metas'
import styles from './DetalhesGrupo.module.css'

export function DetalhesGrupo() {

  // pega o id do grupo pela URL (ex: /grupos/123)
  const { id } = useParams()

  // controla qual aba esta visivel
  const [abaAtiva, setAbaAtiva] = useState('visaoGeral')

  // renderiza o conteudo conforme a aba selecionada
  function renderizaAba() {
    if (abaAtiva === 'visaoGeral') return <VisaoGeral />
    if (abaAtiva === 'despesas') return <Despesas />
    if (abaAtiva === 'metas') return <Metas />
  }

  // retorna o estilo certo para cada aba
  function classeAba(nomeAba) {
    if (abaAtiva === nomeAba) return styles.abaAtiva
    return ''
  }

  return (
    <div>

      {/* header com nome do grupo */}
      <h1>Nome do Grupo</h1>

      {/* navegação entre abas */}
      <div className={styles.tabs}>
        <button className={classeAba('visaoGeral')} onClick={() => setAbaAtiva('visaoGeral')}>
          Visão Geral
        </button>

        <button className={classeAba('despesas')} onClick={() => setAbaAtiva('despesas')}>
          Despesas
        </button>

        <button className={classeAba('metas')} onClick={() => setAbaAtiva('metas')}>
          Metas
        </button>
      </div>

      {/* conteúdo da aba ativa */}
      <div>
        {renderizaAba()}
      </div>

    </div>
  )
}
