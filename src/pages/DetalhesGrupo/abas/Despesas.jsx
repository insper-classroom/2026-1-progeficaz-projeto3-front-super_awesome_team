import { useState } from "react";
import DespesaForm from "../../../components/DespesaForm";
import DespesaCard from "../../../components/DespesaCard";
import Button from "../../../components/Button";

export function Despesas() {
  const [despesas, setDespesas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoIndice, setEditandoIndice] = useState(null);

  function salvarDespesa(despesa) {
    if (editandoIndice !== null) {
      const novas = [...despesas];
      novas[editandoIndice] = despesa;
      setDespesas(novas);
      setEditandoIndice(null);
    } else {
      setDespesas([...despesas, despesa]);
    }

    setMostrarForm(false);
  }

  function abrirNovaDespesa() {
    setEditandoIndice(null);
    setMostrarForm(true);
  }

  function abrirEdicao(indice) {
    setEditandoIndice(indice);
    setMostrarForm(true);
  }

  function fecharForm() {
    setMostrarForm(false);
    setEditandoIndice(null);
  }

  return (
    <div>
      <h2>Despesas</h2>

      <Button onClick={abrirNovaDespesa}>+ Nova despesa</Button>

      {mostrarForm && (
        <DespesaForm
          initialData={editandoIndice !== null ? despesas[editandoIndice] : null}
          onAdd={salvarDespesa}
          onClose={fecharForm}
        />
      )}

      <div style={{ marginTop: "20px" }}>
        {despesas.map((d, i) => (
          <DespesaCard
            key={i}
            despesa={d}
            onEdit={() => abrirEdicao(i)}
            onDelete={() => setDespesas(despesas.filter((_, index) => index !== i))}
          />
        ))}
      </div>
    </div>
  );
}