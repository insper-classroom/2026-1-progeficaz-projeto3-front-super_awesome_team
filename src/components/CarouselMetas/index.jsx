// Carrossel de metas do grupo: 3 cards visíveis, setas anterior/próximo, barra de progresso.
// Aceita onVerMetas para navegar para a aba de Metas ao clicar em "ver metas ↗".
import { useState, useRef, useLayoutEffect } from 'react'
import styles from './CarouselMetas.module.css'

const VISIVEIS = 3
const ESPACO = 16

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

export default function CarouselMetas({ metas = [], onVerMetas }) {
  const [indice, setIndice] = useState(0)
  const [larguraCartao, setLarguraCartao] = useState(0)
  const carrosselRef = useRef(null)

  // Mede o carrossel para calcular a largura exata de cada cartão em px
  useLayoutEffect(() => {
    function medir() {
      if (carrosselRef.current) {
        setLarguraCartao((carrosselRef.current.clientWidth - ESPACO * (VISIVEIS - 1)) / VISIVEIS)
      }
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  if (!metas.length) return null

  const podeAnterior = indice > 0
  const podeProximo = metas.length > VISIVEIS && indice < metas.length - VISIVEIS
  const deslocamento = indice * (larguraCartao + ESPACO)

  // Estilo da trilha calculado antes do JSX
  let estilo = {}
  if (larguraCartao) {
    estilo = { width: larguraCartao }
  }

  return (
    <div className={styles.secao}>

      <div className={styles.cabecalho}>
        <span className={styles.titulo}>Metas</span>
        {onVerMetas && (
          <button className={styles.verMetas} onClick={onVerMetas}>ver metas ↗</button>
        )}
      </div>

      <div className={styles.carrosselWrap}>
        <button
          className={`${styles.seta} ${styles.setaAnterior}`}
          onClick={() => setIndice(indice - 1)}
          disabled={!podeAnterior}
          aria-label="anterior"
        >‹</button>

        <div className={styles.carrossel} ref={carrosselRef}>
          <div
            className={styles.trilha}
            style={{ transform: `translateX(-${deslocamento}px)` }}
          >
            {metas.map((meta) => {
              const pct = Math.round((meta.alcancado / meta.total) * 100)
              return (
                <div key={meta.id} className={styles.cartao} style={estilo}>

                  {/* Topo: emoji, nome, prazo e link da meta */}
                  <div className={styles.cartaoTopo}>
                    <div className={styles.icone}>{meta.emoji}</div>
                    <div className={styles.infoNome}>
                      <div className={styles.nome}>{meta.nome}</div>
                      <div className={styles.prazo}>Prazo: {meta.prazo}</div>
                    </div>
                    {/* Link ainda sem rota — será conectado quando a página de meta existir */}
                    <span className={styles.verMeta}>ver meta ↗</span>
                  </div>

                  {/* Progresso */}
                  <div className={styles.progressoCabecalho}>
                    <span className={styles.progressoLabel}>Progresso</span>
                    <span className={styles.progressoPct}>{pct}%</span>
                  </div>
                  <div className={styles.barra}>
                    <div className={styles.barraPreenchimento} style={{ width: `${pct}%` }} />
                  </div>

                  {/* Valores: alcançado vs meta total */}
                  <div className={styles.valores}>
                    <div>
                      <div className={styles.valoresRotulo}>Alcançado</div>
                      <div className={styles.valoresNumero}>{formatarMoeda(meta.alcancado)}</div>
                    </div>
                    <div className={styles.valoresDireita}>
                      <div className={styles.valoresRotulo}>Meta total</div>
                      <div className={styles.valoresNumero}>{formatarMoeda(meta.total)}</div>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        </div>

        <button
          className={`${styles.seta} ${styles.setaProxima}`}
          onClick={() => setIndice(indice + 1)}
          disabled={!podeProximo}
          aria-label="próximo"
        >›</button>
      </div>

    </div>
  )
}
