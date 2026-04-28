import { useState } from "react";
import styles from "./DespesaForm.module.css";

export default function DespesaForm({ onAdd, onClose }) {
  const [nome, setNome] = useState("");
  const [total, setTotal] = useState(0);

  const [membros, setMembros] = useState([
    { nome: "Membro 1", valor: "", percentual: "" }
  ]);

  // VALOR → %
  function handleValor(i, valor) {
    const novos = [...membros];
    novos[i].valor = Number(valor);

    novos[i].percentual = total
      ? ((valor / total) * 100).toFixed(2)
      : "";

    setMembros(novos);
  }

  // % → VALOR
  function handlePercentual(i, percentual) {
    const novos = [...membros];
    novos[i].percentual = Number(percentual);

    novos[i].valor = total
      ? ((percentual / 100) * total).toFixed(2)
      : "";

    setMembros(novos);
  }

  // ADICIONAR MEMBRO
  function adicionarMembro() {
    setMembros([
      ...membros,
      {
        nome: `Membro ${membros.length + 1}`,
        valor: "",
        percentual: ""
      }
    ]);
  }

  // REMOVER MEMBRO
  function removerMembro(index) {
    const novos = membros.filter((_, i) => i !== index);
    setMembros(novos);
  }

  // DIVIDIR IGUAL
  function dividirIgual() {
    if (!total || membros.length === 0) return;

    const valorPorPessoa = total / membros.length;

    const novos = membros.map((m) => ({
      ...m,
      valor: valorPorPessoa.toFixed(2),
      percentual: (100 / membros.length).toFixed(2)
    }));

    setMembros(novos);
  }

  function salvar() {
    onAdd({
      nome,
      total,
      membros
    });
  }


return (
  <div className={styles.overlay}>
    <div className={styles.container}>

      <h3 className={styles.title}>Nova despesa</h3>

      <input
        className={styles.input}
        placeholder="Nome da despesa"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <div className={styles.field}>
        <span className={styles.prefix}>R$</span>
        <input
          className={`${styles.input} ${styles.inputPrefix}`}
          type="number"
          placeholder="Valor total"
          onChange={(e) => setTotal(Number(e.target.value))}
        />
      </div>

      <div className={styles.membersHeader}>
        <h4>Membros</h4>

        <div className={styles.membersActions}>
            <button className={styles.primary} onClick={adicionarMembro}>
            + Adicionar
            </button>

            <button className={styles.primary} onClick={dividirIgual}>
            Dividir igualmente
            </button>
        </div>
        </div>

      {membros.map((m, i) => (
        <div key={i} className={styles.memberRow}>

          {/* avatar */}
          <div className={styles.avatar}>
            {m.nome ? m.nome.charAt(0) : "?"}
            </div>

            <select
            className={styles.select}
            value={m.nome}
            onChange={(e) => {
                const novos = [...membros];
                novos[i].nome = e.target.value;
                setMembros(novos);
            }}
            >
            <option value="">Selecionar</option>
            <option value="João">João</option>
            <option value="Maria">Maria</option>
            <option value="Pedro">Pedro</option>
            </select>

          <div className={styles.field}>
            <span className={styles.prefix}>R$</span>
            <input
              className={`${styles.input} ${styles.inputPrefix}`}
              type="number"
              value={m.valor || ""}
              onChange={(e) => handleValor(i, e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.prefix}>%</span>
            <input
              className={`${styles.input} ${styles.inputPrefix}`}
              type="number"
              value={m.percentual || ""}
              onChange={(e) => handlePercentual(i, e.target.value)}
            />
          </div>

          <button
            className={styles.removeBtn}
            onClick={() => removerMembro(i)}
          >
            ❌
          </button>
        </div>
      ))}

      <div className={styles.actions}>
        <button className={styles.secondary} onClick={onClose}>
          Cancelar
        </button>

        <button className={styles.primary} onClick={salvar}>
          Salvar
        </button>
      </div>

    </div>
  </div>
);
}