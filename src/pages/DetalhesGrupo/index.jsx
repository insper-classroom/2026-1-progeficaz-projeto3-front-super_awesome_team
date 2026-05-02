// Página detalhada do grupo (dashboard compartilhado entre membros)
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { VisaoGeral } from './abas/VisaoGeral'
import { Despesas } from './abas/Despesas'
import { Metas } from './abas/Metas'
import CabecalhoGrupo from '../../components/CabecalhoGrupo'
import { useVisaoGeral } from '../../hooks/useVisaoGeral'
import styles from './DetalhesGrupo.module.css'

export function DetalhesGrupo() {

  // pega o id do grupo pela URL (ex: /grupos/123)
  const { id } = useParams()

  // busca os dados do grupo (mock por enquanto, troca pela API depois)
  const { data } = useVisaoGeral(id)

  // controla qual aba esta visivel
  const [abaAtiva, setAbaAtiva] = useState('visaoGeral')

  // renderiza o conteudo conforme a aba selecionada
  function renderizaAba() {
    if (abaAtiva === 'visaoGeral') return <VisaoGeral grupoId={id} onVerMetas={() => setAbaAtiva('metas')} onVerDespesas={() => setAbaAtiva('despesas')} />
    if (abaAtiva === 'despesas') return <Despesas />
    if (abaAtiva === 'metas') return <Metas metas={data?.metas} membros={data?.grupo?.membros} />
  }

  // retorna o estilo certo para cada aba
  function classeAba(nomeAba) {
    if (abaAtiva === nomeAba) return styles.abaAtiva
    return ''
  }

  return (
    <div className={styles.pagina}>

      {/* cabeçalho com nome do grupo, botão voltar e avatares dos membros */}
      <CabecalhoGrupo grupo={data?.grupo} />

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
