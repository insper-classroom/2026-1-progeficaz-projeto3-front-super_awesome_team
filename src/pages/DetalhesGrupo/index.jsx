import { useState } from "react";

export default function DetalhesGrupo() {
  const [despesas, setDespesas] = useState([
    { nome: "Pizza", valor: 120 },
    { nome: "Mercado", valor: 300 }
  ]);

  function adicionarDespesa() {
    const nome = prompt("Nome da despesa:");
    const valor = prompt("Valor:");

    if (!nome || !valor) return;

    setDespesas([
      ...despesas,
      { nome, valor: Number(valor) }
    ]);
  }

  return (
    <div>
      <h1>Despesas do grupo</h1>

      <button onClick={adicionarDespesa}>
        + Nova despesa
      </button>

      <ul>
        {despesas.map((d, i) => (
          <li key={i}>
            {d.nome} - R$ {d.valor}
          </li>
        ))}
      </ul>
    </div>
  );
}