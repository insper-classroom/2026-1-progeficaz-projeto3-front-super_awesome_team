import styles from './EstadoVazio.module.css'

export default function EstadoVazio({
  titulo,
  descricao,
  rotuloAcao,
  aoAcionar,
  classe = '',
}) {
  return (
    <div className={`${styles.estadoVazio} ${classe}`}>
      <span className={styles.marcaLogo} aria-hidden="true">
        <img className={styles.logoClaro} src="/black-icon.png" alt="" />
        <img className={styles.logoEscuro} src="/logo-icon.png" alt="" />
      </span>

      <div className={styles.texto}>
        <strong>{titulo}</strong>
        {descricao && <span>{descricao}</span>}
      </div>

      {rotuloAcao && aoAcionar && (
        <button type="button" className={styles.botaoAcao} onClick={aoAcionar}>
          {rotuloAcao}
        </button>
      )}
    </div>
  )
}
