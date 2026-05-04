import { useCallback, useEffect, useState } from 'react'
import DespesaForm from '../../../components/DespesaForm'
import DespesaCard from '../../../components/DespesaCard'
import {
  criarContaGrupo,
  listarContasDoGrupo,
  marcarContaComoPaga,
} from '../../../services/billService'

export function Despesas({ grupoId, grupo }) {
  const [despesas, setDespesas] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [modoLocal, setModoLocal] = useState(false)

  const carregarContas = useCallback(async () => {
    if (!grupoId) return

    setCarregando(true)
    setErro('')

    try {
      const contas = await listarContasDoGrupo(grupoId)
      setDespesas(contas.filter((conta) => !conta.paga))
      setModoLocal(false)
    } catch {
      // Fallback local preservado para manter a aba testavel sem apagar os mocks.
      setModoLocal(true)
      setErro('Não foi possível carregar as contas do backend. Usando dados locais nesta sessão.')
    } finally {
      setCarregando(false)
    }
  }, [grupoId])

  useEffect(() => {
    Promise.resolve().then(carregarContas)
  }, [carregarContas])

  async function adicionarDespesa(despesa) {
    setErro('')

    if (modoLocal || !grupoId) {
      setDespesas([...despesas, despesa])
      setMostrarForm(false)
      return
    }

    setSalvando(true)
    try {
      await criarContaGrupo({
        grupoId,
        nome: despesa.nome,
        total: despesa.total,
        membros: despesa.membros,
      })
      await carregarContas()
      setMostrarForm(false)
    } catch (error) {
      setErro(error.response?.data?.error || 'Não foi possível criar a conta.')
    } finally {
      setSalvando(false)
    }
  }

  async function concluirDespesa(despesa, index) {
    setErro('')

    if (modoLocal || !despesa.id) {
      setDespesas(despesas.filter((_, despesaIndex) => despesaIndex !== index))
      return
    }

    try {
      await marcarContaComoPaga(despesa.id)
      setDespesas(despesas.filter((conta) => conta.id !== despesa.id))
    } catch (error) {
      setErro(error.response?.data?.error || 'Não foi possível concluir a conta.')
    }
  }

  return (
    <div>
      <h2>Despesas</h2>

      <button onClick={() => setMostrarForm(true)}>+ Nova despesa</button>

      {carregando && <p>Carregando despesas...</p>}
      {erro && <p>{erro}</p>}

      {mostrarForm && (
        <DespesaForm
          membrosDoGrupo={grupo?.membros}
          onAdd={adicionarDespesa}
          onClose={() => setMostrarForm(false)}
          salvando={salvando}
        />
      )}

      {despesas.map((d, i) => (
        <DespesaCard
          key={i}
          despesa={d}
          onDelete={() => concluirDespesa(d, i)}
        />
      ))}
    </div>
  )
}
