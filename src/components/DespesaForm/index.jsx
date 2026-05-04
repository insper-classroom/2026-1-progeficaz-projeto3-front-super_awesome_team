import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
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

function normalizarDataInput(data) {
  if (!data) return "";
  return String(data).split("T")[0];
}

function normalizarMembroInicial(membro, opcoesMembros) {
  const opcao = opcoesMembros.find(
    (item) => item.email === membro.email || item.nome === membro.nome
  );

  return {
    email: opcao?.email || membro.email || membro.nome || "",
    nome: opcao?.nome || membro.nome || nomeDoEmail(membro.email),
    valor: membro.valor ?? membro.value ?? "",
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
  erroExterno = "",
}) {
  const [nome, setNome] = useState("");
  const [total, setTotal] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [pixKey, setPixKey] = useState("");
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
        setDueDate(normalizarDataInput(initialData.dueDate));
        setPixKey(initialData.pixKey ?? "");

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
        setDueDate("");
        setPixKey("");
        setMembros([criarMembroVazio(opcoesMembros[0])]);
      }

      setErro("");
    });
  }, [initialData, modo, opcoesMembros]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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

  function salvar(e) {
    e.preventDefault();

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

    if (!pixKey.trim()) {
      setErro("Informe a chave PIX do credor.");
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
      dueDate,
      pixKey: pixKey.trim(),
      membros: membrosComValor.map((membro) => ({
        email: membro.email,
        nome: membro.nome,
        valor: Number(membro.valor || 0),
        percentual: Number(membro.percentual || 0),
        cor: membro.cor,
      })),
    });
  }

  const mensagemErro = erroExterno || erro;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={modo === "edit" ? "Editar despesa" : "Nova despesa"}
      >
        <div className={styles.cabecalho}>
          <h2 className={styles.title}>
            {modo === "edit" ? "Editar despesa" : "Nova despesa"}
          </h2>
          <button
            type="button"
            className={styles.botaoFechar}
            onClick={onClose}
            aria-label="Fechar"
          >
            <FiX />
          </button>
        </div>

        <form className={styles.form} onSubmit={salvar}>
          {mensagemErro && (
            <div className={styles.erro} role="alert">
              {mensagemErro}
            </div>
          )}
          {opcoesMembros.length === 0 && (
            <div className={styles.erro} role="alert">
              Carregue os membros do grupo antes de criar despesas.
            </div>
          )}

          <div className={styles.grupo}>
            <label className={styles.rotulo}>Nome da despesa</label>
            <input
              className={styles.input}
              placeholder="Ex: Mercado"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className={styles.grupo}>
            <label className={styles.rotulo}>Valor total</label>
            <div className={styles.inputComPrefixo}>
              <span className={styles.prefixo}>R$</span>
              <input
                className={styles.inputSemBorda}
                type="number"
                min="1"
                step="0.01"
                placeholder="0"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.grupo}>
            <label className={styles.rotulo}>Pagar até</label>
            <input
              className={styles.input}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className={styles.grupo}>
            <label className={styles.rotulo}>Chave PIX do credor</label>
            <input
              className={styles.input}
              placeholder="E-mail, CPF, telefone ou chave aleatória"
              value={pixKey}
              onChange={(e) => {
                setPixKey(e.target.value);
                setErro("");
              }}
              required
            />
          </div>

          <div className={styles.membersHeader}>
            <span className={styles.tituloSecao}>Membros</span>

            <div className={styles.membersActions}>
              <button
                type="button"
                className={styles.botaoTexto}
                onClick={adicionarMembro}
                disabled={opcoesMembros.length === 0}
              >
                <FiPlus />
                Adicionar
              </button>
              <button
                type="button"
                className={styles.botaoTexto}
                onClick={dividirIgual}
                disabled={opcoesMembros.length === 0}
              >
                Dividir igualmente
              </button>
            </div>
          </div>

          <div className={styles.memberList}>
            {membros.map((m, i) => (
              <div key={i} className={styles.memberRow}>
                <div className={styles.avatar} style={{ backgroundColor: m.cor }}>
                  {m.nome ? m.nome.charAt(0) : "?"}
                </div>

                <div className={styles.campoMembro}>
                  <label className={styles.rotuloLinha}>Membro</label>
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
                </div>

                <div className={styles.campoMembro}>
                  <label className={styles.rotuloLinha}>Valor</label>
                  <div className={styles.inputComPrefixo}>
                    <span className={styles.prefixo}>R$</span>
                    <input
                      className={styles.inputSemBorda}
                      type="number"
                      min="0"
                      step="0.01"
                      value={m.valor || ""}
                      onChange={(e) => handleValor(i, e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.campoMembro}>
                  <label className={styles.rotuloLinha}>Percentual</label>
                  <div className={styles.inputComPrefixo}>
                    <span className={styles.prefixo}>%</span>
                    <input
                      className={styles.inputSemBorda}
                      type="number"
                      min="0"
                      step="0.01"
                      value={m.percentual || ""}
                      onChange={(e) => handlePercentual(i, e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className={styles.removeBtn}
                  onClick={() => removerMembro(i)}
                  type="button"
                  aria-label="Remover membro"
                  disabled={membros.length === 1}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.botaoCancelar} onClick={onClose}>
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.botaoConfirmar}
              disabled={salvando || opcoesMembros.length === 0}
            >
              {salvando
                ? "Salvando..."
                : modo === "edit"
                  ? "Salvar alterações"
                  : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
