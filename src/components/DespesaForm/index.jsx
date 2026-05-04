import { useEffect, useMemo, useState } from "react";
import styles from "./DespesaForm.module.css";

const membrosFallback = [
  { email: "joao@example.com", nome: "João" },
  { email: "maria@example.com", nome: "Maria" },
  { email: "pedro@example.com", nome: "Pedro" },
];
const membrosVazios = [];

function nomeDoEmail(email) {
  if (!email) return "Membro";
  return email.split("@")[0];
}

function normalizarOpcaoMembro(membro, index) {
  const email = membro.email || membro.id || membro.nome || `membro-${index + 1}`;
  return {
    email,
    nome: membro.nome || nomeDoEmail(email),
  };
}

function criarLinhaMembro(membro) {
  return {
    email: membro.email,
    nome: membro.nome,
    valor: "",
    percentual: "",
  };
}

export default function DespesaForm({ membrosDoGrupo = membrosVazios, onAdd, onClose, salvando = false }) {
  const [nome, setNome] = useState("");
  const [total, setTotal] = useState(0);
  const opcoesMembros = useMemo(() => {
    const origem = membrosDoGrupo.length ? membrosDoGrupo : membrosFallback;
    return origem.map(normalizarOpcaoMembro);
  }, [membrosDoGrupo]);

  const [membros, setMembros] = useState([
    criarLinhaMembro(normalizarOpcaoMembro(membrosFallback[0], 0))
  ]);

  useEffect(() => {
    Promise.resolve().then(() => setMembros((membrosAtuais) => {
      const membroExisteNasOpcoes = membrosAtuais.some((membro) =>
        opcoesMembros.some((opcao) => opcao.email === membro.email)
      );

      if (membroExisteNasOpcoes) return membrosAtuais;
      return [criarLinhaMembro(opcoesMembros[0])];
    }));
  }, [opcoesMembros]);

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
    const emailsSelecionados = membros.map((membro) => membro.email);
    const proximoMembro = opcoesMembros.find(
      (membro) => !emailsSelecionados.includes(membro.email)
    );

    if (!proximoMembro) return;

    setMembros([
      ...membros,
      criarLinhaMembro(proximoMembro)
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
      membros: membros.filter((membro) => membro.email && Number(membro.valor) > 0)
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
            value={m.email}
            onChange={(e) => {
                const novos = [...membros];
                const membroSelecionado = opcoesMembros.find((opcao) => opcao.email === e.target.value);
                if (!membroSelecionado) return;
                novos[i] = {
                  ...novos[i],
                  email: membroSelecionado.email,
                  nome: membroSelecionado.nome,
                };
                setMembros(novos);
            }}
            >
            <option value="">Selecionar</option>
            {opcoesMembros.map((membro) => (
              <option key={membro.email} value={membro.email}>
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
          >
            ❌
          </button>
        </div>
      ))}

      <div className={styles.actions}>
        <button className={styles.secondary} onClick={onClose}>
          Cancelar
        </button>

        <button className={styles.primary} onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>

    </div>
  </div>
);
}
