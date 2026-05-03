import { useState } from "react";
import DespesaForm from "../../../components/DespesaForm";
import DespesaCard from "../../../components/DespesaCard";
import Button from "../../../components/Button";
import { despesasMock } from "../../../mocks/despesasMock.js";

export function Despesas() {
  const [despesas, setDespesas] = useState(despesasMock);
  const [modal, setModal] = useState({
    aberto: false,
    tipo: null,
    despesa: null,
    indice: null,
  });

  function abrirNovaDespesa() {
    setModal({
      aberto: true,
      tipo: "form",
      despesa: null,
      indice: null,
    });
  }

  function abrirDetalhe(despesa, indice) {
    setModal({
      aberto: true,
      tipo: "detalhe",
      despesa,
      indice,
    });
  }

  function abrirEdicao(despesa, indice) {
    setModal({
      aberto: true,
      tipo: "form",
      despesa,
      indice,
    });
  }

  function fecharModal() {
    setModal({
      aberto: false,
      tipo: null,
      despesa: null,
      indice: null,
    });
  }

  function salvarDespesa(despesaSalva) {
    if (modal.indice !== null) {
      const novas = [...despesas];
      novas[modal.indice] = despesaSalva;
      setDespesas(novas);
    } else {
      setDespesas((prev) => [...prev, despesaSalva]);
    }

    fecharModal();
  }

  function deletarDespesa(indice) {
    setDespesas((prev) => prev.filter((_, i) => i !== indice));

    if (modal.indice === indice) {
      fecharModal();
    }
  }

  return (
    <div>
      <h2>Despesas</h2>

      <Button onClick={abrirNovaDespesa}>+ Nova despesa</Button>

      {modal.aberto && modal.tipo === "form" && (
        <DespesaForm
          initialData={modal.despesa}
          modo={modal.indice !== null ? "edit" : "create"}
          onSave={salvarDespesa}
          onClose={fecharModal}
        />
      )}

      <div style={{ marginTop: "20px" }}>
        {despesas.map((d, i) => (
          <DespesaCard
            key={i}
            despesa={d}
            aberto={modal.aberto && modal.tipo === "detalhe" && modal.indice === i}
            onOpen={() => abrirDetalhe(d, i)}
            onClose={fecharModal}
            onEdit={() => abrirEdicao(d, i)}
            onDelete={() => deletarDespesa(i)}
          />
        ))}
      </div>
    </div>
  );
}