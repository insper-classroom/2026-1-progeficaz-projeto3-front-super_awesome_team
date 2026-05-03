// Página de verificação de e-mail — exibida após cadastro
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./VerifyEmail.module.css";

export function VerifyEmail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;

  return (
    <div className={styles.page}>
      <div className={styles.illustration}>
        <img
          src="/verify-email.png"
          alt=""
          className={styles.illustrationImg}
        />
      </div>

      <div className={styles.content}>
        <h1 className={styles.headline}>
          Confirme o seu e-mail para concluir o cadastro e acessar a sua conta!
        </h1>

        <div className={styles.card}>
          <p className={styles.step}>1. Abra o e-mail que enviamos para</p>

          <div className={styles.emailBox}>
            <p className={styles.emailText}>{email}</p>
          </div>

          <p className={styles.desc}>
            Este endereço de e-mail está incorreto? Registre-se novamente com um
            e-mail diferente fazendo login{" "}
            <a className={styles.link} onClick={() => navigate("/cadastro")}>
              aqui
            </a>
          </p>

          <p className={styles.desc}>
            Verifique suas pastas de spam e notificações em sua Caixa de
            Entrada.
          </p>

          <p className={styles.step}>2. Clique no botão "CONFIRME"</p>

          <p className={styles.desc}>
            Desta forma, marcaremos seu endereço de e-mail como confirmado.
          </p>
        </div>
      </div>
    </div>
  );
}
