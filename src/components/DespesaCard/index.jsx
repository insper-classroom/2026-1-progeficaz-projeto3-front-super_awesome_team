import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Button from "../Button";
import styles from "./DespesaCard.module.css";

const CORES_FALLBACK = [
  "var(--primary)",
  "var(--positive)",
  "var(--negative)",
  "var(--text-muted)",
  "var(--primary)",
  "var(--positive)",
];

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function corSuave(cor) {
  return `color-mix(in srgb, ${cor} 14%, transparent)`;
}

function formatarData(data) {
  if (!data) return null;
  const dataObj = new Date(data);
  if (Number.isNaN(dataObj.getTime())) return null;

  return dataObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatarDataHora(data) {
  if (!data) return null;
  const dataObj = new Date(data);
  if (Number.isNaN(dataObj.getTime())) return null;

  return dataObj.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DespesaCard({
  despesa,
  aberto,
  onOpen,
  onClose,
  onEdit,
  onConfirmarPagamento,
  onConcluirDespesa,
  usuarioEmail,
  confirmandoPendenciaId,
  concluindoDespesaId,
  somenteModal = false,
}) {
  const membros = useMemo(
    () => (Array.isArray(despesa?.membros) ? despesa.membros : []),
    [despesa]
  );
  const total = Number(despesa?.total ?? 0) || 0;
  const prazoFormatado = formatarData(despesa?.dueDate);
  const podeEditar = usuarioEmail && usuarioEmail === despesa?.credorEmail && !despesa?.concluida;
  const podeConcluir = usuarioEmail && usuarioEmail === despesa?.credorEmail && !despesa?.concluida;
  const concluindoDespesa = concluindoDespesaId === despesa?.id;

  const membrosColoridos = useMemo(
    () =>
      membros.map((m, i) => ({
        ...m,
        cor: m.cor || CORES_FALLBACK[i % CORES_FALLBACK.length],
      })),
    [membros]
  );

  const pagoTotal = useMemo(() => {
    return membrosColoridos.reduce((acc, m) => {
      if (m.pago) return acc + Number(m.valor || 0);
      return acc;
    }, 0);
  }, [membrosColoridos]);

  const percentualPago = total > 0 ? (pagoTotal / total) * 100 : 0;

  const chartData = useMemo(() => {
    const pagos = membrosColoridos
      .filter((m) => m.pago && Number(m.valor || 0) > 0)
      .map((m) => ({
        name: m.nome,
        value: Number(m.valor || 0),
        cor: m.cor,
      }));

    if (pagos.length === 0) {
      return [{ name: "Não pago", value: total || 1, cor: "var(--border)" }];
    }

    return pagos;
  }, [membrosColoridos, total]);

  function textoStatusMembro(membro) {
    if (membro.papel === "credor") return "Credor";
    if (membro.resolvida) return "Pago";
    if (membro.devedorConfirmou && !membro.credorConfirmou) return "Aguardando credor";
    if (membro.credorConfirmou && !membro.devedorConfirmou) return "Aguardando devedor";
    return "Pendente";
  }

  function textoAcaoMembro(membro) {
    if (!membro.pendenciaId || membro.resolvida) return null;
    if (membro.email === usuarioEmail && !membro.devedorConfirmou) {
      return "Confirmar pagamento";
    }
    if (membro.credorEmail === usuarioEmail && !membro.credorConfirmou) {
      return "Confirmar recebimento";
    }
    return null;
  }

  return (
    <>
      {!somenteModal && (
        <button type="button" className={styles.card} onClick={onOpen}>
          <div className={styles.cardTop}>
            <div>
              <h4 className={styles.cardTitle}>{despesa?.nome ?? "Despesa"}</h4>
              <p className={styles.cardSubtitle}>{formatarMoeda(total)}</p>
            </div>
          </div>
        </button>
      )}

      {aberto && (
        <div className={styles.overlay} onClick={onClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>{despesa?.nome ?? "Despesa"}</h3>
                <p className={styles.modalSubtitle}>
                  {formatarMoeda(total)} • {percentualPago.toFixed(0)}% pago
                </p>
                {despesa?.credorEmail && (
                  <p className={styles.modalSubtitle}>
                    Credor: {despesa.credorNome || despesa.credorEmail}
                  </p>
                )}
                {prazoFormatado && (
                  <p className={styles.modalSubtitle}>Pagar até {prazoFormatado}</p>
                )}
              </div>

              <button
                type="button"
                className={styles.closeBtn}
                onClick={onClose}
              >
                X
              </button>
            </div>

            <div className={styles.modalGrid}>
              <div className={styles.chartCard}>
                <div className={styles.chartBox}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={52}
                        outerRadius={78}
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className={styles.chartCenter}>
                    <span className={styles.chartLabel}>Pago</span>
                    <strong className={styles.chartValue}>
                      {percentualPago.toFixed(0)}%
                    </strong>
                  </div>
                </div>
              </div>

              <div className={styles.detailCard}>
                <h4 className={styles.detailTitle}>Membros</h4>

                <div className={styles.memberList}>
                  {membrosColoridos.map((m, i) => {
                    const valor = Number(m.valor || 0);
                    const pago = m.pago ? valor : 0;
                    const restante = Math.max(valor - pago, 0);
                    const textoAcao = textoAcaoMembro(m);
                    const confirmando = confirmandoPendenciaId === m.pendenciaId;

                    return (
                      <div key={i} className={styles.memberRow}>
                        <div className={styles.memberTop}>
                          <div className={styles.memberInfo}>
                            <div
                              className={styles.avatarMini}
                              style={{ backgroundColor: m.cor }}
                            >
                              {m?.nome ? m.nome.charAt(0) : "?"}
                            </div>

                            <div>
                              <strong>{m.nome}</strong>
                              <p>
                                {m.papel === "credor" ? "Credor" : "Deve"}{" "}
                                {formatarMoeda(valor)}
                              </p>
                            </div>
                          </div>

                          <span
                            className={
                              m.pago || m.papel === "credor"
                                ? styles.badgePago
                                : styles.badgePendente
                            }
                          >
                            {textoStatusMembro(m)}
                          </span>
                        </div>

                        {m.papel !== "credor" && (
                          <div className={styles.confirmationRow}>
                            <span
                              className={
                                m.devedorConfirmou
                                  ? styles.confirmacaoOk
                                  : styles.confirmacaoPendente
                              }
                            >
                              Devedor
                              {m.devedorConfirmouEm && (
                                <small>{formatarDataHora(m.devedorConfirmouEm)}</small>
                              )}
                            </span>
                            <span
                              className={
                                m.credorConfirmou
                                  ? styles.confirmacaoOk
                                  : styles.confirmacaoPendente
                              }
                            >
                              Credor
                              {m.credorConfirmouEm && (
                                <small>{formatarDataHora(m.credorConfirmouEm)}</small>
                              )}
                            </span>
                          </div>
                        )}

                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressPago}
                            style={{
                              width: `${m.pago ? 100 : 0}%`,
                              backgroundColor: m.cor,
                            }}
                          />
                          <div
                            className={styles.progressPendente}
                            style={{
                              width: `${m.pago ? 0 : 100}%`,
                              backgroundColor: corSuave(m.cor),
                            }}
                          />
                        </div>

                        <div className={styles.memberAmounts}>
                          <span>Pago: {formatarMoeda(pago)}</span>
                          <span>Falta: {formatarMoeda(restante)}</span>
                        </div>

                        {textoAcao && (
                          <button
                            type="button"
                            className={styles.memberAction}
                            onClick={() => onConfirmarPagamento(m)}
                            disabled={confirmando}
                          >
                            {confirmando ? "Confirmando..." : textoAcao}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {(podeEditar || podeConcluir) && (
                  <div className={styles.actions}>
                    {podeEditar && <Button onClick={onEdit}>Editar</Button>}
                    {podeConcluir && (
                      <Button
                        variant="secondary"
                        onClick={() => onConcluirDespesa(despesa)}
                        disabled={concluindoDespesa}
                      >
                        {concluindoDespesa ? "Concluindo..." : "Concluir despesa"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
