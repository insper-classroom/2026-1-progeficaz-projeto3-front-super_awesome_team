import styles from "./DespesaCard.module.css";

export default function DespesaCard({ despesa, onDelete, onEdit }) {
  const membros = Array.isArray(despesa?.membros) ? despesa.membros : [];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h4>{despesa?.nome ?? "Despesa"}</h4>
        <span>R$ {despesa?.total ?? 0}</span>
      </div>

      <div className={styles.membros}>
        {membros.map((m, i) => (
          <div key={i} className={styles.membro}>
            <span>{m?.nome ?? "Membro"}</span>
            <span>R$ {m?.valor ?? 0}</span>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.primaryBtn} onClick={onEdit}>
          Editar
        </button>

        <button className={styles.secondaryBtn} onClick={onDelete}>
          Concluído
        </button>
      </div>
    </div>
  );
}