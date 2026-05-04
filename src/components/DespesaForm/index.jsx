import { useEffect, useState } from "react";
import styles from "./DespesaForm.module.css";
import Button from "../Button";
import { membrosMock } from "../../mocks/membrosMock";

function criarMembroVazio(indice = 1) {
  return {
    nome: "",
    valor: "",
    percentual: "",
    pago: false,
  };
}

export default function DespesaForm({
  onSave,
  onClose,
  initialData,
  modo = "create", // "create" | "edit"
}) {
  const [nome, setNome] = useState("");
  const [total, setTotal] = useState("");
  const [membros, setMembros] = useState([criarMembroVazio(1)]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome ?? "");
      setTotal(initialData.total ?? "");

      const membrosIniciais =
        Array.isArray(initialData.membros) && initialData.membros.length > 0
          ? initialData.membros.map((m) => ({
              nome: m.nome ?? "",
              valor: m.valor ?? "",
              percentual: m.percentual ?? "",
              pago: m.pago ?? false,
            }))
          : [criarMembroVazio(1)];

      setMembros(membrosIniciais);
    } else {
      setNome("");
      setTotal("");
      setMembros([criarMembroVazio(1)]);
    }

    setErro("");
  }, [initialData, modo]);

  function handleValor(i, valor) {
    const totalNum = Number(total);
    const novos = [...membros];
    const valorNum = valor === "" ? "" : Number(valor);

    novos[i].valor = valorNum;
    novos[i].percentual =
      totalNum && valorNum !== ""
        ? ((Number(valorNum) / totalNum) * 100).toFixed(2)
        : "";

    setMembros(novos);
    setErro("");
  }

  function handlePercentual(i, percentual) {
    const totalNum = Number(total);
    const novos = [...membros];
    const percentualNum = percentual === "" ? "" : Number(percentual);

    novos[i].percentual = percentualNum;
    novos[i].valor =
      totalNum && percentualNum !== ""
        ? ((Number(percentualNum) / 100) * totalNum).toFixed(2)
        : "";

    setMembros(novos);
    setErro("");
  }

  function togglePago(i, checked) {
    const novos = [...membros];
    novos[i].pago = checked;
    setMembros(novos);
    setErro("");
  }

  function adicionarMembro() {
    setMembros([...membros, criarMembroVazio(membros.length + 1)]);
  }

  function removerMembro(index) {
    if (membros.length === 1) return;
    const novos = membros.filter((_, i) => i !== index);
    setMembros(novos);
  }

  function dividirIgual() {
    const totalNum = Number(total);
    if (!totalNum || membros.length === 0) return;

    const valorPorPessoa = totalNum / membros.length;

    const novos = membros.map((m) => ({
      ...m,
      valor: valorPorPessoa.toFixed(2),
      percentual: (100 / membros.length).toFixed(2),
      pago: m.pago ?? false,
    }));

    setMembros(novos);
    setErro("");
  }

  function salvar() {
    const totalNum = Number(total) || 0;
    const soma = membros.reduce((acc, m) => acc + Number(m.valor || 0), 0);

    if (!nome.trim()) {
      setErro("Informe o nome da despesa.");
      return;
    }

    if (totalNum <= 0) {
      setErro("Informe um valor total válido.");
      return;
    }

    if (Math.round(soma * 100) !== Math.round(totalNum * 100)) {
      setErro("A soma dos valores dos membros precisa ser igual ao valor total.");
      return;
    }

    onSave({
      nome: nome.trim(),
      total: totalNum,
      membros: membros.map((m) => ({
        nome: m.nome,
        valor: Number(m.valor || 0),
        percentual: Number(m.percentual || 0),
        pago: Boolean(m.pago),
      })),
    });
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h3 className={styles.title}>
          {modo === "edit" ? "Editar despesa" : "Nova despesa"}
        </h3>

        {erro && <p className={styles.erro}>{erro}</p>}

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
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>

        <div className={styles.membersHeader}>
          <h4>Membros</h4>

          <div className={styles.membersActions}>
            <Button onClick={adicionarMembro}>+ Adicionar</Button>
            <Button onClick={dividirIgual}>Dividir igualmente</Button>
          </div>
        </div>

        {membros.map((m, i) => (
          <div key={i} className={styles.memberRow}>


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
              {membrosMock.map((membro) => (
                <option key={membro.id} value={membro.nome}>
                  {membro.nome}
                </option>
              ))}
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
              type="button"
            >
              ❌
            </button>
            {modo === "edit" && (
              <label className={styles.pagoCheckbox}>
                <input
                  type="checkbox"
                  checked={m.pago || false}
                  onChange={(e) => togglePago(i, e.target.checked)}
                />
                Pago
              </label>
            )}
          </div>
        ))}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button onClick={salvar}>
            {modo === "edit" ? "Salvar alterações" : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}