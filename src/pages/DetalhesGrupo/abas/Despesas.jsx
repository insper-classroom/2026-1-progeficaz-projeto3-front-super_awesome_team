import { useState } from "react";
import DespesaForm from "../../../components/DespesaForm";
import DespesaCard from "../../../components/DespesaCard";
import Button from "../../../components/Button";
import styles from "./Despesas.module.css";
import { despesasMock } from "../../../mocks/despesasMock.js";

function calcularStatus(despesa) {
  const membros = Array.isArray(despesa?.membros) ? despesa.membros : [];
  if (membros.length === 0) return "nao_concluida";
  return membros.every((m) => m.pago) ? "concluida" : "nao_concluida";
}

function criarHistoricoInicial() {
  return despesasMock
    .map((despesa, index) => ({
      id: index + 1,
      nome: despesa.nome,
      valor: despesa.total,
      status: calcularStatus(despesa),
    }))
    .reverse();
}

export function Despesas() {
  const [despesas, setDespesas] = useState(despesasMock);
  const [historico, setHistorico] = useState(criarHistoricoInicial());
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
    const novoHistoricoItem = {
      id: Date.now(),
      nome: despesaSalva.nome,
      valor: despesaSalva.total,
      status: calcularStatus(despesaSalva),
    };

    if (modal.indice !== null) {
      const novas = [...despesas];
      novas[modal.indice] = despesaSalva;
      setDespesas(novas);
    } else {
      setDespesas((prev) => [...prev, despesaSalva]);
    }

    setHistorico((prev) => [novoHistoricoItem, ...prev]);
    fecharModal();
  }

  function deletarDespesa(indice) {
    setDespesas((prev) => prev.filter((_, i) => i !== indice));

    if (modal.indice === indice) {
      fecharModal();
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.topArea}>
          <h2 className={styles.title}>Despesas</h2>

          <Button onClick={abrirNovaDespesa}>+ Nova despesa</Button>
        </div>

        {modal.aberto && modal.tipo === "form" && (
          <DespesaForm
            initialData={modal.despesa}
            modo={modal.indice !== null ? "edit" : "create"}
            onSave={salvarDespesa}
            onClose={fecharModal}
          />
        )}

        <div className={styles.gridDespesas}>
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
      </main>

      <aside className={styles.historico}>
        <h3 className={styles.historicoTitle}>Histórico de despesas</h3>

        <div className={styles.historicoLista}>
          {historico.map((item) => (
            <div key={item.id} className={styles.historicoItem}>
              <div>
                <strong className={styles.historicoNome}>{item.nome}</strong>
                <p className={styles.historicoValor}>R$ {Number(item.valor).toFixed(2)}</p>
              </div>

              <span
                className={
                  item.status === "concluida"
                    ? styles.badgeConcluida
                    : styles.badgePendente
                }
              >
                {item.status === "concluida" ? "Concluída" : "Não concluída"}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}