// Página de login — autenticação por e-mail/senha ou Google
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    // TODO: integrar com API de autenticação
    navigate("/grupos");
  }

  return (
    <div className={styles.page}>
      <div className={styles.logoBox}>
        <img src="/logo-icon.png" alt="Adapte" className={styles.logoImg} />
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <p className={styles.subtitle}>
          Entre na sua conta preenchendo os campos abaixo
        </p>

        <button type="button" className={styles.googleBtn}>
          <img src="/google-icon.png" alt="" className={styles.googleIcon} />
          Entre com o Google
        </button>

        <form className={styles.inputGroup} onSubmit={handleLogin}>
          <input
            className={styles.input}
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Senha *"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </form>

        <button
          type="submit"
          className={styles.submitBtn}
          onClick={handleLogin}
        >
          Entrar
        </button>

        <p className={styles.or}>OU</p>

        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => navigate("/cadastro")}
        >
          Cadastre-se agora
        </button>
      </div>
    </div>
  );
}
