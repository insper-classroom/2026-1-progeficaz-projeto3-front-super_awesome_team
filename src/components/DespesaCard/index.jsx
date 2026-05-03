import { useMemo, useState } from "react";
import styles from "./DespesaCard.module.css";
import Button from "../Button";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const CORES = ["#1f7a63", "#2563eb", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6"];

function comAlpha(hex, alpha = "22") {
  return `${hex}${alpha}`;
}

export default function DespesaCard({ despesa, onEdit, onDelete }) {
  const [mostrarModal, setMostrarModal] = useState(false);

  const membros = Array.isArray(despesa?.membros) ? despesa.membros : [];
  const total = Number(despesa?.total ?? 0) || 0;

  const membrosColoridos = useMemo(
    () =>
      membros.map((m, i) => ({
        ...m,
        cor: CORES[i % CORES.length],
      })),
    [membros]
  );

  const pagoTotal = useMemo(() => {
    return membros.reduce((acc, m) => {
      if (m.pago) return acc + Number(m.valor || 0);
      return acc;
    }, 0);
  }, [membros]);

  const percentualPago = total > 0 ? (pagoTotal / total) * 100 : 0;

  const chartData = useMemo(() => {
    const pago = Math.max(pagoTotal, 0);
    const restante = Math.max(total - pagoTotal, 0);

    return [
      { name: "Pago", value: pago, cor: "#1f7a63" },
      { name: "Falta", value: restante, cor: "#d1d5db" },
    ].filter((item) => item.value > 0);
  }, [pagoTotal, total]);

  return (
    <>
      <button
        type="button"
        className={styles.card}
        onClick={() => setMostrarModal(true)}
      >
        <div className={styles.header}>
          <div className={styles.infoPrincipal}>
            <h4 className={styles.nome}>{despesa?.nome ?? "Despesa"}</h4>
            <span className={styles.total}>R$ {total.toFixed(2)}</span>
          </div>

          <div className={styles.membrosResumo}>
            {membrosColoridos.map((m, i) => (
              <div
                key={i}
                className={styles.avatar}
                title={m?.nome ?? "Membro"}
                style={{ backgroundColor: m.cor }}
              >
                {m?.nome ? m.nome.charAt(0) : "?"}
              </div>
            ))}
          </div>
        </div>
      </button>

      {mostrarModal && (
        <div
          className={styles.overlay}
          onClick={() => setMostrarModal(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>{despesa?.nome ?? "Despesa"}</h3>
                <p className={styles.modalSubtitle}>
                  R$ {total.toFixed(2)} • {percentualPago.toFixed(0)}% pago
                </p>
              </div>

              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setMostrarModal(false)}
              >
                ✕
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
                              <p>Deve R$ {valor.toFixed(2)}</p>
                            </div>
                          </div>

                          <span className={m.pago ? styles.badgePago : styles.badgePendente}>
                            {m.pago ? "Pago" : "Não pago"}
                          </span>
                        </div>

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
                              backgroundColor: comAlpha(m.cor),
                            }}
                          />
                        </div>

                        <div className={styles.memberAmounts}>
                          <span>Pago: R$ {pago.toFixed(2)}</span>
                          <span>Falta: R$ {restante.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.actions}>
                  <Button onClick={onEdit}>Editar</Button>
                  <Button variant="secondary" onClick={onDelete}>
                    Concluído
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}