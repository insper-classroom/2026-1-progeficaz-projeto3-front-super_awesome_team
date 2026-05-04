// Página detalhada do grupo (dashboard compartilhado entre membros)
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { VisaoGeral } from './abas/VisaoGeral'
import { Despesas } from './abas/Despesas'
import { Metas } from './abas/Metas'
import CabecalhoGrupo from '../../components/CabecalhoGrupo'
import { useVisaoGeral } from '../../hooks/useVisaoGeral'
import { buscarGrupo } from '../../services/groupService'
import styles from './DetalhesGrupo.module.css'

export function DetalhesGrupo() {

  // pega o id do grupo pela URL (ex: /grupos/123)
  const { id } = useParams()

  // busca os dados do grupo (mock por enquanto, troca pela API depois)
  const { data } = useVisaoGeral(id)
  const [grupo, setGrupo] = useState(null)

  // controla qual aba esta visivel
  const [abaAtiva, setAbaAtiva] = useState('visaoGeral')
  const [metaInicialId, setMetaInicialId] = useState(null)

  useEffect(() => {
    async function carregarGrupo() {
      try {
        const grupoCarregado = await buscarGrupo(id)
        setGrupo(grupoCarregado)
      } catch {
        setGrupo(null)
      }
    }

    carregarGrupo()
  }, [id])

  function abrirAbaMetas(metaId = null) {
    setMetaInicialId(metaId)
    setAbaAtiva('metas')
  }

  useEffect(() => {
    async function carregarGrupo() {
      try {
        const grupoCarregado = await buscarGrupo(id)
        setGrupo(grupoCarregado)
      } catch {
        setGrupo(null)
      }
    }

    carregarGrupo()
  }, [id])

  // renderiza o conteudo conforme a aba selecionada
  function renderizaAba() {
    if (abaAtiva === 'visaoGeral') return <VisaoGeral grupoId={id} onVerMetas={abrirAbaMetas} onVerDespesas={() => setAbaAtiva('despesas')} />
    if (abaAtiva === 'despesas') return <Despesas grupoId={id} grupo={grupo || data?.grupo} />
    if (abaAtiva === 'metas') return <Metas grupoId={id} metaInicialId={metaInicialId} />
  }

  // retorna o estilo certo para cada aba
  function classeAba(nomeAba) {
    if (abaAtiva === nomeAba) return styles.abaAtiva
    return ''
  }

  return (
    <div className={styles.pagina}>

      {/* cabeçalho com nome do grupo, botão voltar e avatares dos membros */}
      <CabecalhoGrupo grupo={grupo || data?.grupo} />

      {/* navegação entre abas */}
      <div className={styles.tabs}>
        <button className={classeAba('visaoGeral')} onClick={() => setAbaAtiva('visaoGeral')}>
          Visão Geral
        </button>

        <button className={classeAba('despesas')} onClick={() => setAbaAtiva('despesas')}>
          Despesas
        </button>

        <button className={classeAba('metas')} onClick={() => abrirAbaMetas()}>
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
