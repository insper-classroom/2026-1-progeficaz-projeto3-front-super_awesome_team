import { useCallback, useEffect, useState } from "react";
import DespesaForm from "../../../components/DespesaForm";
import DespesaCard from "../../../components/DespesaCard";
import Button from "../../../components/Button";
import { useUser } from "../../../hooks/useUser";
import {
  atualizarContaGrupo,
  criarContaGrupo,
  listarContasDoGrupo,
} from "../../../services/billService";
import {
  confirmarPagamentoComoDevedor,
  confirmarRecebimentoComoCredor,
  listarPendenciasDoGrupo,
} from "../../../services/pendencyService";
import styles from "./Despesas.module.css";

function calcularStatus(despesa) {
  if (typeof despesa?.concluida === "boolean") {
    return despesa.concluida ? "concluida" : "nao_concluida";
  }
  if (despesa?.paga) return "concluida";

  const membros = Array.isArray(despesa?.membros) ? despesa.membros : [];
  if (membros.length === 0) return "nao_concluida";
  return membros.every((m) => m.pago) ? "concluida" : "nao_concluida";
}

function criarHistorico(despesas) {
  return despesas
    .map((despesa, index) => ({
      id: despesa.id || `historico-${index}`,
      nome: despesa.nome,
      valor: despesa.total,
      status: calcularStatus(despesa),
      criadaEm: despesa.criadaEm,
      ordemOriginal: index,
    }))
    .sort((a, b) => {
      const dataA = new Date(a.criadaEm).getTime();
      const dataB = new Date(b.criadaEm).getTime();

      if (Number.isFinite(dataA) && Number.isFinite(dataB)) {
        return dataB - dataA;
      }

      return b.ordemOriginal - a.ordemOriginal;
    });
}

function nomeDoEmail(email) {
  if (!email) return "Credor";
  return email.split("@")[0];
}

function normalizarDespesaComGrupo(despesa, grupo) {
  const membrosGrupo = grupo?.membros || [];
  const credorGrupo = membrosGrupo.find(
    (item) => item.email === despesa.criadaPor || item.id === despesa.criadaPor
  );

  return {
    ...despesa,
    credorNome: credorGrupo?.nome || nomeDoEmail(despesa.criadaPor),
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

function agruparPendenciasPorConta(pendencias) {
  return pendencias.reduce((mapa, pendencia) => {
    const pendenciasDaConta = mapa.get(pendencia.billId) || [];
    pendenciasDaConta.push(pendencia);
    mapa.set(pendencia.billId, pendenciasDaConta);
    return mapa;
  }, new Map());
}

function aplicarPendenciasNaDespesa(despesa, pendencias) {
  const credorEmail = despesa.criadaPor;

  const membros = despesa.membros.map((membro) => {
    const pendencia = pendencias.find(
      (item) => item.devedorEmail === membro.email
    );
    const ehCredor = membro.email === credorEmail;
    const resolvida = pendencia ? pendencia.resolvida : Boolean(despesa.paga || ehCredor);

    return {
      ...membro,
      papel: ehCredor ? "credor" : "devedor",
      pendenciaId: pendencia?.id,
      credorEmail,
      devedorConfirmou: pendencia?.devedorConfirmou ?? false,
      credorConfirmou: pendencia?.credorConfirmou ?? false,
      resolvida,
      pago: resolvida,
    };
  });

  const devedores = membros.filter((membro) => membro.email !== credorEmail);
  const concluida = Boolean(despesa.paga) || (
    devedores.length === 0
      ? true
      : devedores.every((membro) => membro.resolvida)
  );

  return {
    ...despesa,
    credorEmail,
    pendencias,
    membros,
    concluida,
  };
}

export function Despesas({ grupoId, grupo }) {
  const { usuario } = useUser();
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
  const [confirmandoPendenciaId, setConfirmandoPendenciaId] = useState(null);
  const [erro, setErro] = useState("");

  const carregarContas = useCallback(async () => {
    if (!grupoId) return;

    setCarregando(true);
    setErro("");

    try {
      const [contas, pendencias] = await Promise.all([
        listarContasDoGrupo(grupoId),
        listarPendenciasDoGrupo(grupoId),
      ]);
      const pendenciasPorConta = agruparPendenciasPorConta(pendencias);
      const contasNormalizadas = contas
        .map((conta) => normalizarDespesaComGrupo(conta, grupo))
        .map((conta) =>
          aplicarPendenciasNaDespesa(
            conta,
            pendenciasPorConta.get(conta.id) || []
          )
        );
      const contasAbertas = contasNormalizadas.filter((conta) => !conta.concluida);

      setDespesas(contasAbertas);
      setHistorico(criarHistorico(contasNormalizadas));
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

  async function confirmarPagamentoMembro(membro) {
    setErro("");

    if (!membro?.pendenciaId) {
      setErro("Pendência não encontrada para confirmar.");
      return;
    }

    const usuarioEmail = usuario?.email;
    const ehDevedor = membro.email === usuarioEmail;
    const ehCredor = membro.credorEmail === usuarioEmail;

    if (!ehDevedor && !ehCredor) {
      setErro("Apenas o credor ou o devedor podem confirmar este pagamento.");
      return;
    }

    setConfirmandoPendenciaId(membro.pendenciaId);
    try {
      if (ehCredor) {
        await confirmarRecebimentoComoCredor(membro.pendenciaId);
      } else {
        await confirmarPagamentoComoDevedor(membro.pendenciaId);
      }

      await carregarContas();
      fecharModal();
    } catch (error) {
      setErro(error.response?.data?.error || "Não foi possível confirmar o pagamento.");
    } finally {
      setConfirmandoPendenciaId(null);
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
              onConfirmarPagamento={confirmarPagamentoMembro}
              usuarioEmail={usuario?.email}
              confirmandoPendenciaId={confirmandoPendenciaId}
            />
          ))}
        </div>
      </main>

      <aside className={styles.historico}>
        <h3 className={styles.historicoTitle}>Histórico de despesas</h3>

        <div className={styles.historicoLista}>
          {historico.length > 0 ? (
            historico.map((item) => (
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
            ))
          ) : (
            <p className={styles.historicoVazio}>Nenhuma despesa registrada.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
