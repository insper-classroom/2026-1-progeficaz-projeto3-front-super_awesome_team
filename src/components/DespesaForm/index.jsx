import { useEffect, useMemo, useState } from "react";
import Button from "../Button";
import styles from "./DespesaForm.module.css";

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
    cor: membro.cor,
  };
}

function criarMembroVazio(membro = {}) {
  return {
    email: membro.email || "",
    nome: membro.nome || "",
    valor: "",
    percentual: "",
    pago: false,
    cor: membro.cor,
  };
}

function normalizarMembroInicial(membro, opcoesMembros) {
  const opcao = opcoesMembros.find(
    (item) => item.email === membro.email || item.nome === membro.nome
  );

  return {
    email: opcao?.email || membro.email || membro.nome || "",
    nome: opcao?.nome || membro.nome || nomeDoEmail(membro.email),
    valor: membro.valor ?? "",
    percentual: membro.percentual ?? "",
    pago: membro.pago ?? false,
    cor: opcao?.cor || membro.cor,
  };
}

export default function DespesaForm({
  membrosDoGrupo = membrosVazios,
  onSave,
  onClose,
  initialData,
  modo = "create",
  salvando = false,
}) {
  const [nome, setNome] = useState("");
  const [total, setTotal] = useState("");
  const [membros, setMembros] = useState([criarMembroVazio()]);
  const [erro, setErro] = useState("");

  const opcoesMembros = useMemo(() => {
    return membrosDoGrupo.map(normalizarOpcaoMembro);
  }, [membrosDoGrupo]);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (initialData) {
        setNome(initialData.nome ?? "");
        setTotal(initialData.total ?? "");

        const membrosIniciais =
          Array.isArray(initialData.membros) && initialData.membros.length > 0
            ? initialData.membros.map((membro) =>
                normalizarMembroInicial(membro, opcoesMembros)
              )
            : [criarMembroVazio(opcoesMembros[0])];

        setMembros(membrosIniciais);
      } else {
        setNome("");
        setTotal("");
        setMembros([criarMembroVazio(opcoesMembros[0])]);
      }

      setErro("");
    });
  }, [initialData, modo, opcoesMembros]);

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

  function adicionarMembro() {
    const emailsSelecionados = membros.map((membro) => membro.email);
    const proximoMembro = opcoesMembros.find(
      (membro) => !emailsSelecionados.includes(membro.email)
    );

    if (!proximoMembro) return;

    setMembros([...membros, criarMembroVazio(proximoMembro)]);
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
    const membrosComValor = membros.filter(
      (membro) => membro.email && Number(membro.valor || 0) > 0
    );
    const soma = membrosComValor.reduce(
      (acc, membro) => acc + Number(membro.valor || 0),
      0
    );

    if (opcoesMembros.length === 0) {
      setErro("Não foi possível carregar os membros do grupo.");
      return;
    }

    if (!nome.trim()) {
      setErro("Informe o nome da despesa.");
      return;
    }

    if (totalNum <= 0) {
      setErro("Informe um valor total válido.");
      return;
    }

    if (membrosComValor.length === 0) {
      setErro("Informe pelo menos um membro com valor.");
      return;
    }

    if (Math.round(soma * 100) !== Math.round(totalNum * 100)) {
      setErro("A soma dos valores dos membros precisa ser igual ao valor total.");
      return;
    }

    onSave({
      id: initialData?.id,
      nome: nome.trim(),
      total: totalNum,
      membros: membrosComValor.map((membro) => ({
        email: membro.email,
        nome: membro.nome,
        valor: Number(membro.valor || 0),
        percentual: Number(membro.percentual || 0),
        cor: membro.cor,
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
        {opcoesMembros.length === 0 && (
          <p className={styles.erro}>Carregue os membros do grupo antes de criar despesas.</p>
        )}

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
            <Button onClick={adicionarMembro} disabled={opcoesMembros.length === 0}>+ Adicionar</Button>
            <Button onClick={dividirIgual} disabled={opcoesMembros.length === 0}>Dividir igualmente</Button>
          </div>
        </div>

        {membros.map((m, i) => (
          <div key={i} className={styles.memberRow}>
            <div className={styles.avatar}>
              {m.nome ? m.nome.charAt(0) : "?"}
            </div>

            <select
              className={styles.select}
              value={m.email}
              onChange={(e) => {
                const novos = [...membros];
                const membroSelecionado = opcoesMembros.find(
                  (opcao) => opcao.email === e.target.value
                );
                if (!membroSelecionado) return;
                novos[i] = {
                  ...novos[i],
                  email: membroSelecionado.email,
                  nome: membroSelecionado.nome,
                  cor: membroSelecionado.cor,
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
              type="button"
            >
              X
            </button>
          </div>
        ))}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button onClick={salvar} disabled={salvando || opcoesMembros.length === 0}>
            {salvando
              ? "Salvando..."
              : modo === "edit"
                ? "Salvar alterações"
                : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
