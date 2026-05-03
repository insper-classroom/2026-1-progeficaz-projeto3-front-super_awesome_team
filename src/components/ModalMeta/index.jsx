// Modal de criação e edição de meta.
// meta=null → nova meta; meta={...} → editar existente.
import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import IconeMeta from '../IconeMeta'
import styles from './ModalMeta.module.css'

const ICONES_SUGERIDOS = [
  { valor: 'casa', rotulo: 'Casa' },
  { valor: 'viagem', rotulo: 'Viagem' },
  { valor: 'reserva', rotulo: 'Reserva' },
  { valor: 'moveis', rotulo: 'Moveis' },
  { valor: 'reforma', rotulo: 'Reforma' },
  { valor: 'estudo', rotulo: 'Estudo' },
  { valor: 'carro', rotulo: 'Carro' },
  { valor: 'casamento', rotulo: 'Casamento' },
  { valor: 'celular', rotulo: 'Celular' },
  { valor: 'mundo', rotulo: 'Mundo' },
]

// Mês atual no formato YYYY-MM, usado como limite mínimo do prazo.
const MES_ATUAL = new Date().toISOString().slice(0, 7)

function normalizarTexto(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function obterIconeInicial(meta) {
  if (meta?.icone) return meta.icone

  const nomeMeta = normalizarTexto(meta?.nome)
  if (nomeMeta.includes('entrada') || nomeMeta.includes('casa') || nomeMeta.includes('ape')) return 'casa'
  if (nomeMeta.includes('viagem')) return 'viagem'
  if (nomeMeta.includes('reserva')) return 'reserva'
  if (nomeMeta.includes('moveis')) return 'moveis'
  if (nomeMeta.includes('reforma')) return 'reforma'

  return 'meta'
}

function valorInicial(meta) {
  return {
    nome:        meta?.nome        ?? '',
    icone:       obterIconeInicial(meta),
    total:       meta?.total       ?? '',
    prazoData:   meta?.prazoData   ?? '',
    membrosIds:  meta?.membrosIds  ?? [],
  }
}

export default function ModalMeta({ meta, membros, onSalvar, onFechar }) {
  const [form, setForm] = useState(() => valorInicial(meta))

  const editando = meta != null

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onFechar])

  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function classeBotaoIcone(valor) {
    if (form.icone === valor) return `${styles.botaoIcone} ${styles.botaoIconeAtivo}`
    return styles.botaoIcone
  }

  function toggleMembro(id) {
    setForm((prev) => {
      const jaTem = prev.membrosIds.includes(id)
      return {
        ...prev,
        membrosIds: jaTem
          ? prev.membrosIds.filter((m) => m !== id)
          : [...prev.membrosIds, id],
      }
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSalvar({
      ...form,
      total: Number(form.total),
    })
  }

  const formularioValido =
    form.nome.trim().length >= 2 &&
    Number(form.total) > 0 &&
    form.prazoData !== ''

  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={editando ? 'Editar meta' : 'Nova meta'}
      >

        <div className={styles.cabecalho}>
          <h2 className={styles.titulo}>{editando ? 'Editar meta' : 'Nova meta'}</h2>
          <button type="button" className={styles.botaoFechar} onClick={onFechar} aria-label="Fechar">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Icone + nome na mesma linha */}
          <div className={styles.linhaIconeNome}>
            <div className={styles.grupoIcone}>
              <span className={styles.previewIcone}>
                <IconeMeta meta={{ icone: form.icone, nome: form.nome }} />
              </span>
            </div>
            <div className={styles.grupoNome}>
              <label className={styles.rotulo}>Nome da meta</label>
              <input
                className={styles.input}
                type="text"
                value={form.nome}
                onChange={(e) => atualizar('nome', e.target.value)}
                placeholder="Ex: Entrada do apê"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Atalhos de icone */}
          <div className={styles.iconesSugeridos}>
            {ICONES_SUGERIDOS.map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                className={classeBotaoIcone(opcao.valor)}
                onClick={() => atualizar('icone', opcao.valor)}
                aria-label={`Usar icone ${opcao.rotulo}`}
              >
                <IconeMeta meta={{ icone: opcao.valor }} />
              </button>
            ))}
          </div>

          {/* Valor total */}
          <div className={styles.grupo}>
            <label className={styles.rotulo}>Valor total</label>
            <div className={styles.inputComPrefixo}>
              <span className={styles.prefixo}>R$</span>
              <input
                className={styles.inputSemBorda}
                type="number"
                min="1"
                step="1"
                value={form.total}
                onChange={(e) => atualizar('total', e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Prazo */}
          <div className={styles.grupo}>
            <label className={styles.rotulo}>Prazo</label>
            <input
              className={styles.input}
              type="month"
              min={MES_ATUAL}
              value={form.prazoData}
              onChange={(e) => atualizar('prazoData', e.target.value)}
              required
            />
          </div>

          {/* Membros vinculados a meta */}
          <div className={styles.grupo}>
            <label className={styles.rotulo}>Membros</label>
            <div className={styles.checkboxGrupo}>
              {membros.map((membro) => (
                <label key={membro.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.membrosIds.includes(membro.id)}
                    onChange={() => toggleMembro(membro.id)}
                  />
                  <span
                    className={styles.avatarCheckbox}
                    style={{ backgroundColor: membro.cor }}
                  >
                    {membro.iniciais}
                  </span>
                  {membro.nome}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.rodape}>
            <button type="button" className={styles.botaoCancelar} onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className={styles.botaoConfirmar} disabled={!formularioValido}>
              {editando ? 'Salvar alterações' : 'Criar meta'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
