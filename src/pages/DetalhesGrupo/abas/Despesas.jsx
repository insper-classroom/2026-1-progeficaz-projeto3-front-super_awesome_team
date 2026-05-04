import { useCallback, useEffect, useState } from "react";
import DespesaForm from "../../../components/DespesaForm";
import DespesaCard from "../../../components/DespesaCard";
import Button from "../../../components/Button";
import {
  atualizarContaGrupo,
  criarContaGrupo,
  listarContasDoGrupo,
  marcarContaComoPaga,
} from "../../../services/billService";
import styles from "./Despesas.module.css";

function calcularStatus(despesa) {
  if (despesa?.paga) return "concluida";

  const membros = Array.isArray(despesa?.membros) ? despesa.membros : [];
  if (membros.length === 0) return "nao_concluida";
  return membros.every((m) => m.pago) ? "concluida" : "nao_concluida";
}

function criarHistorico(despesas) {
  return despesas
    .map((despesa, index) => ({
      id: despesa.id || index + 1,
      nome: despesa.nome,
      valor: despesa.total,
      status: calcularStatus(despesa),
    }))
    .reverse();
}

function normalizarDespesaComGrupo(despesa, grupo) {
  const membrosGrupo = grupo?.membros || [];

  return {
    ...despesa,
    membros: (despesa.membros || []).map((membro, index) => {
      const membroGrupo = membrosGrupo.find(
        (item) =>
          item.email === membro.email ||
          item.id === membro.email ||
          item.nome === membro.nome
      );

      return {
        ...membro,
        email: membro.email || membroGrupo?.email || membroGrupo?.id || membro.nome,
        nome: membroGrupo?.nome || membro.nome,
        cor: membro.cor || membroGrupo?.cor,
        percentual: membro.percentual || (despesa.total ? (membro.valor / despesa.total) * 100 : 0),
        pago: Boolean(despesa.paga || membro.pago),
        id: membro.id || membro.email || index,
      };
    }),
  };
}

export function Despesas({ grupoId, grupo }) {
  const [despesas, setDespesas] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [modal, setModal] = useState({
    aberto: false,
    tipo: null,
    despesa: null,
    indice: null,
  });
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const carregarContas = useCallback(async () => {
    if (!grupoId) return;

    setCarregando(true);
    setErro("");

    try {
      const contas = await listarContasDoGrupo(grupoId);
      const contasAbertas = contas
        .filter((conta) => !conta.paga)
        .map((conta) => normalizarDespesaComGrupo(conta, grupo));

      setDespesas(contasAbertas);
      setHistorico(criarHistorico(contasAbertas));
    } catch (error) {
      setDespesas([]);
      setHistorico([]);
      setErro(error.response?.data?.error || "Não foi possível carregar as contas do backend.");
    } finally {
      setCarregando(false);
    }
  }, [grupo, grupoId]);

  useEffect(() => {
    Promise.resolve().then(carregarContas);
  }, [carregarContas]);

  function abrirNovaDespesa() {
    setErro("");
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
    setErro("");
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

  async function salvarDespesa(despesaSalva) {
    setErro("");

    if (!grupoId) {
      setErro("Grupo não encontrado para salvar a conta.");
      return;
    }

    setSalvando(true);
    try {
      if (modal.indice !== null && modal.despesa?.id) {
        await atualizarContaGrupo(modal.despesa.id, despesaSalva);
      } else {
        await criarContaGrupo({
          grupoId,
          nome: despesaSalva.nome,
          total: despesaSalva.total,
          membros: despesaSalva.membros,
        });
      }

      await carregarContas();
      fecharModal();
    } catch (error) {
      setErro(error.response?.data?.error || "Não foi possível salvar a conta.");
    } finally {
      setSalvando(false);
    }
  }

  async function concluirDespesa(indice) {
    const despesa = despesas[indice];
    setErro("");

    if (!despesa?.id) {
      setErro("Conta não encontrada para concluir.");
      return;
    }

    try {
      await marcarContaComoPaga(despesa.id);
      await carregarContas();
      fecharModal();
    } catch (error) {
      setErro(error.response?.data?.error || "Não foi possível concluir a conta.");
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.topArea}>
          <h2 className={styles.title}>Despesas</h2>

          <Button onClick={abrirNovaDespesa}>+ Nova despesa</Button>
        </div>

        {carregando && <p>Carregando despesas...</p>}
        {erro && <p>{erro}</p>}

        {modal.aberto && modal.tipo === "form" && (
          <DespesaForm
            initialData={modal.despesa}
            modo={modal.indice !== null ? "edit" : "create"}
            membrosDoGrupo={grupo?.membros}
            onSave={salvarDespesa}
            onClose={fecharModal}
            salvando={salvando}
          />
        )}

        <div className={styles.gridDespesas}>
          {despesas.map((d, i) => (
            <DespesaCard
              key={d.id || i}
              despesa={d}
              aberto={modal.aberto && modal.tipo === "detalhe" && modal.indice === i}
              onOpen={() => abrirDetalhe(d, i)}
              onClose={fecharModal}
              onEdit={() => abrirEdicao(d, i)}
              onDelete={() => concluirDespesa(i)}
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
                <p className={styles.historicoValor}>
                  R$ {Number(item.valor).toFixed(2)}
                </p>
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
