function Despesas() {
  return (
    <div>
      <h2>Despesas</h2>

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