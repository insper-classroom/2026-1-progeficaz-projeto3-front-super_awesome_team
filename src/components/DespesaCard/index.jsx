import styles from "./DespesaCard.module.css";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function DespesaCard({ despesa, onDelete }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h4>{despesa.nome}</h4>
        <span>{formatarMoeda(despesa.total)}</span>
      </div>

      <div className={styles.membros}>
        {despesa.membros.map((m, i) => (
          <div key={i} className={styles.membro}>
            <span>{m.nome}</span>
            <span>{formatarMoeda(m.valor)}</span>
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
