// Card de categorias: donut à esquerda, tabela comparativa à direita.
// Comparação sempre vs mês anterior — não varia com o filtro de período.
// Hover do donut mostra nome + porcentagem.
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import styles from './SecaoCategorias.module.css'

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

function TooltipDonut({ active, payload }) {
  if (!active || !payload?.length) return null
  const cat = payload[0].payload
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipPonto} style={{ background: cat.cor }} />
      <span>{cat.nome}</span>
      <strong>{cat.pct}%</strong>
    </div>
  )
}

export default function SecaoCategorias({ categorias, categoriasPrev, onVerMais }) {
  if (!categorias?.length) return null

  return (
    <div className={styles.secao}>
      <span className={styles.tituloSecao}>Categorias</span>

      <div className={styles.cartaoSplit}>

        {/* Lado esquerdo: donut */}
        <div className={styles.ladoPizza}>
          <PieChart width={150} height={150}>
            <Pie
              data={categorias}
              cx={75} cy={75}
              innerRadius={42} outerRadius={68}
              dataKey="valor"
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              nameKey="nome"
            >
              {categorias.map((cat) => (
                <Cell key={cat.nome} fill={cat.cor} />
              ))}
            </Pie>
            <Tooltip content={<TooltipDonut />} />
          </PieChart>
        </div>

        {/* Lado direito: tabela comparativa */}
        <div className={styles.ladoTabela}>
          <div className={styles.cabecalhoTabela}>
            <span className={styles.tituloTabela}>Principais categorias</span>
            {onVerMais && (
              <button className={styles.verMais} onClick={onVerMais}>ver mais ↗</button>
            )}
          </div>

          <div className={styles.rotulosColunas}>
            <span>Categoria</span>
            <span style={{ textAlign: 'right' }}>Atual</span>
            <span style={{ paddingLeft: 12 }}>vs Mês Anterior</span>
            <span>Variação</span>
            <span style={{ textAlign: 'right' }}>Anterior</span>
          </div>

          {categorias.map((cat, i) => {
            const prev = categoriasPrev?.[i] ?? { valor: 0, variacaoPct: null }
            const temComparacao = prev.variacaoPct !== null && prev.variacaoPct !== undefined
            const caiu = temComparacao && prev.variacaoPct < 0

            // Cor da barra e classe do badge calculados antes do JSX
            let corBarra = 'var(--text-muted)'
            let classeBadge = styles.badgeNeutro
            let textoBadge = 'novo'
            if (temComparacao && caiu) {
              corBarra = 'var(--positive)'
              classeBadge = styles.badgeBaixo
              textoBadge = `↘ ${Math.abs(prev.variacaoPct)}%`
            } else if (temComparacao) {
              corBarra = 'var(--negative)'
              classeBadge = styles.badgeCima
              textoBadge = `↗ ${Math.abs(prev.variacaoPct)}%`
            }

            return (
              <div key={cat.nome} className={styles.linha}>
                <div className={styles.linhaNome}>
                  <div className={styles.linhaPonto} style={{ background: cat.cor }} />
                  {cat.nome}
                </div>
                <div className={styles.linhaValor}>{formatarMoeda(cat.valor)}</div>
                <div className={styles.barraWrap}>
                  <div className={styles.barraTrilha}>
                    {/* largura proporcional ao % do total de gastos */}
                    <div
                      className={styles.barraPreenchimento}
                      style={{ width: `${cat.pct}%`, background: corBarra }}
                    />
                  </div>
                </div>
                <div>
                  <span className={`${styles.badge} ${classeBadge}`}>
                    {textoBadge}
                  </span>
                </div>
                <div className={styles.linhaAnterior}>{formatarMoeda(prev.valor)}</div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
