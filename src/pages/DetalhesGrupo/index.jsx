import { useState } from "react";
import styles from "./DetalhesGrupo.module.css";
import { useParams } from "react-router-dom";
import DespesaForm from "../../components/DespesaForm";
import DespesaCard from "../../components/DespesaCard";

export default function DetalhesGrupo() {
  const [aba, setAba] = useState("visao");
  const [despesas, setDespesas] = useState([]);
  const { id } = useParams();
  const [mostrarForm, setMostrarForm] = useState(false);

  function VisaoGeral() {
  return (
    <div>
      <h2>Resumo</h2>
      <p>Saldo restante: R$ 1100</p>
      <p>Total gasto: R$ 100</p>
    </div>
  );
}

function adicionarDespesa(despesa) {
  setDespesas([...despesas, despesa]);
  setMostrarForm(false);
}

function Despesas({ despesas, adicionarDespesa }) {
  return (
    <div>
      <h2>Despesas</h2>

      <button className={styles.primaryBtn} onClick={() => setMostrarForm(true)}>
        + Nova despesa
      </button>

      {mostrarForm && (
        <DespesaForm onAdd={adicionarDespesa} 
        onClose={() => setMostrarForm(false)}
        />
      )}

      {despesas.map((d, i) => (
        <DespesaCard
          key={i}
          despesa={d}
          onDelete={() => {
            const novas = despesas.filter((_, index) => index !== i);
            setDespesas(novas);
          }}
        />
      ))}
    </div>
  );
}

function Metas() {
  return (
    <div>
      <h2>Metas</h2>
      <p>Meta mensal: R$1200</p>
    </div>
  );
}

  return (
    <div>
      <h1>{id}</h1>

      {/* ABAS */}
      <div className={styles.tabs}>
        <button onClick={() => setAba("visao")}>Visão geral</button>
        <button onClick={() => setAba("despesas")}>Despesas</button>
        <button onClick={() => setAba("metas")}>Metas</button>
      </div>

      {/* CONTEÚDO */}
      {aba === "visao" && <VisaoGeral />}
      {aba === "despesas" && (
        <Despesas
          despesas={despesas}
          adicionarDespesa={adicionarDespesa}
        />
      )}
      {aba === "metas" && <Metas />}
    </div>
  );
}