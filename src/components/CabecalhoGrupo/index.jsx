// Cabeçalho da página de detalhes do grupo.
// Mostra: link de voltar, nome do grupo, avatares dos membros e quantidade.
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import styles from './CabecalhoGrupo.module.css'

export default function CabecalhoGrupo({ grupo }) {
  const navegar = useNavigate()

  if (!grupo) return null

  return (
    <div className={styles.container}>
      {/* Botão de voltar para a lista de grupos */}
      <button className={styles.linkVoltar} onClick={() => navegar('/grupos')}>
        <FiArrowLeft size={14} />
        Grupos
      </button>

      <div className={styles.linhaTopo}>
        <div>
          <div className={styles.nomeGrupo}>{grupo.nome}</div>
          {/* Mês e ano atual como referência do período exibido */}
          <div className={styles.mesAno}>
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', ' ')}
          </div>
        </div>

        <div className={styles.linhaMembros}>
          {/* row-reverse para empilhar os avatares da direita pra esquerda */}
          <div className={styles.avatares}>
            {grupo.membros.map((membro) => (
              <div
                key={membro.id}
                className={styles.avatar}
                style={{ background: membro.cor }}
                title={membro.nome}
              >
                {/* Tenta mostrar a foto; se não existir, mostra as iniciais */}
                {membro.foto && (
                  <img
                    src={membro.foto}
                    alt={membro.nome}
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                )}
                {membro.iniciais}
              </div>
            ))}
          </div>
          <span className={styles.quantidadeMembros}>
            {grupo.membros.length} membros
          </span>
        </div>
      </div>
    </div>
  )
}
