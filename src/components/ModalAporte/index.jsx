// Modal para registrar um aporte em uma meta.
// metaInicial pre-seleciona a meta; se null, usa a primeira da lista.
import { useState, useEffect, useRef } from 'react'
import { FiCalendar, FiX } from 'react-icons/fi'
import IconeMeta from '../IconeMeta'
import styles from './ModalAporte.module.css'

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

function valorInicial({ metas, membros, metaInicial, aporteInicial }) {
  return {
    metaId:    aporteInicial?.metaId ?? metaInicial?.id ?? metas[0]?.id ?? '',
    membroId:  aporteInicial?.membroId ?? membros[0]?.id ?? '',
    valor:     aporteInicial?.valor ?? '',
    data:      aporteInicial?.dataValor ?? '',
  }
}

export default function ModalAporte({
  metas,
  membros,
  metaInicial,
  aporteInicial = null,
  onSalvar,
  onFechar,
}) {
  const inputDataRef = useRef(null)
  const [form, setForm] = useState(() => valorInicial({ metas, membros, metaInicial, aporteInicial }))
  const editando = aporteInicial != null

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

  function handleSubmit(e) {
    e.preventDefault()
    onSalvar({
      ...form,
      contributionIndex: aporteInicial?.contributionIndex,
      valor: Number(form.valor),
    })
  }

  function abrirCalendarioData() {
    const input = inputDataRef.current
    if (!input) return

    input.focus()
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    }
  }

  const formularioValido =
    form.metaId !== '' &&
    form.membroId !== '' &&
    Number(form.valor) > 0 &&
    form.data !== ''

  const metaSelecionada = metas.find((m) => m.id === form.metaId)

  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={editando ? 'Editar aporte' : 'Registrar aporte'}
      >

        <div className={styles.cabecalho}>
          <h2 className={styles.titulo}>{editando ? 'Editar aporte' : 'Registrar aporte'}</h2>
          <button type="button" className={styles.botaoFechar} onClick={onFechar} aria-label="Fechar">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Seleção de meta */}
          <div className={styles.grupo}>
            <label className={styles.rotulo}>Meta</label>
            <select
              className={styles.select}
              value={form.metaId}
              onChange={(e) => atualizar('metaId', e.target.value)}
              disabled={editando}
              required
            >
              {metas.map((meta) => (
                <option key={meta.id} value={meta.id}>
                  {meta.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Preview da meta: guardado e faltam */}
          {metaSelecionada && (
            <div className={styles.previewMeta}>
              <div className={styles.previewCabecalhoMeta}>
                <span className={styles.previewIconeMeta}>
                  <IconeMeta meta={metaSelecionada} />
                </span>
                <span className={styles.previewNomeMeta}>{metaSelecionada.nome}</span>
              </div>
              <div className={styles.previewLinha}>
                <span>Guardado</span>
                <strong>{formatarMoeda(metaSelecionada.alcancado)}</strong>
              </div>
              <div className={styles.previewLinha}>
                <span>Faltam</span>
                <strong>{formatarMoeda(metaSelecionada.total - metaSelecionada.alcancado)}</strong>
              </div>
            </div>
          )}

          {/* Quem está aportando */}
          <div className={styles.grupo}>
            <label className={styles.rotulo}>Quem está aportando</label>
            <div className={styles.membroOpcoes}>
              {membros.map((membro) => (
                <button
                  key={membro.id}
                  type="button"
                  className={form.membroId === membro.id
                    ? `${styles.membroBtn} ${styles.membroBtnAtivo}`
                    : styles.membroBtn}
                  onClick={() => atualizar('membroId', membro.id)}
                >
                  <span className={styles.avatarMembro} style={{ backgroundColor: membro.cor }}>
                    {membro.iniciais}
                  </span>
                  {membro.nome}
                </button>
              ))}
            </div>
          </div>

          {/* Valor */}
          <div className={styles.grupo}>
            <label className={styles.rotulo}>Valor</label>
            <div className={styles.inputComPrefixo}>
              <span className={styles.prefixo}>R$</span>
              <input
                className={styles.inputSemBorda}
                type="number"
                min="1"
                step="1"
                value={form.valor}
                onChange={(e) => atualizar('valor', e.target.value)}
                placeholder="0"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Data */}
          <div className={styles.grupo}>
            <label className={styles.rotulo}>Data</label>
            <div className={styles.inputComIconeData} onClick={abrirCalendarioData}>
              <input
                ref={inputDataRef}
                className={`${styles.input} ${styles.inputData}`}
                type="date"
                value={form.data}
                onChange={(e) => atualizar('data', e.target.value)}
                required
              />
              <FiCalendar className={styles.iconeCalendario} aria-hidden="true" />
            </div>
          </div>

          <div className={styles.rodape}>
            <button type="button" className={styles.botaoCancelar} onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className={styles.botaoConfirmar} disabled={!formularioValido}>
              {editando ? 'Salvar alterações' : 'Registrar aporte'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
