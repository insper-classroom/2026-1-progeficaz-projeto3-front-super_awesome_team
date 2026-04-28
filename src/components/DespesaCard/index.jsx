import styles from "./DespesaCard.module.css";

export default function DespesaCard({ despesa, onDelete }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h4>{despesa.nome}</h4>
        <span>R$ {despesa.total}</span>
      </div>

      <div className={styles.membros}>
        {despesa.membros.map((m, i) => (
          <div key={i} className={styles.membro}>
            <span>{m.nome}</span>
            <span>R$ {m.valor}</span>
          </div>
        ))}
      </div>
       <div className={styles.actions}>
        <button className={styles.primaryBtn}>
            Editar
        </button>

        <button className={styles.secondaryBtn} onClick={onDelete}>
            Concluído
        </button>
        </div>
      </div>
  );
}