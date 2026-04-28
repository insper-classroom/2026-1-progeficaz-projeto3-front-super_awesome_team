import { useState } from 'react'
import DespesaForm from '../../../components/DespesaForm'
import DespesaCard from '../../../components/DespesaCard'

export function Despesas() {
  const [despesas, setDespesas] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)

  function adicionarDespesa(despesa) {
    setDespesas([...despesas, despesa])
    setMostrarForm(false)
  }

  return (
    <div>
      <h2>Despesas</h2>

      <button onClick={() => setMostrarForm(true)}>+ Nova despesa</button>

      {mostrarForm && (
        <DespesaForm
          onAdd={adicionarDespesa}
          onClose={() => setMostrarForm(false)}
        />
      )}

      {despesas.map((d, i) => (
        <DespesaCard
          key={i}
          despesa={d}
          onDelete={() => setDespesas(despesas.filter((_, index) => index !== i))}
        />
      ))}
    </div>
  )
}
