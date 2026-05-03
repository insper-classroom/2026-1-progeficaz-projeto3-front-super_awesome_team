// Página de cadastro — criação de nova conta
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Cadastro.module.css";

export function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function handleCadastro(e) {
    e.preventDefault();
    // TODO: integrar com API de cadastro
    navigate("/verificar-email", { state: { email } });
  }

  return (
    <div className={styles.page}>
      <div className={styles.logoBox}>
        <img src="/logo-icon.png" alt="Adapte" className={styles.logoImg} />
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>Inscrever-se</h1>
        <p className={styles.subtitle}>
          Inscreva-se gratuitamente e adapte com a gente
        </p>

        <button type="button" className={styles.googleBtn}>
          <img src="/google-icon.png" alt="" className={styles.googleIcon} />
          Entre com o Google
        </button>

        <form className={styles.inputGroup} onSubmit={handleCadastro}>
          <input
            className={styles.input}
            type="text"
            placeholder="Nome *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
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
          onClick={handleCadastro}
        >
          Criar conta
        </button>

        <p className={styles.or}>OU</p>

        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => navigate("/login")}
        >
          Já sou cadastrado
        </button>
      </div>
    </div>
  );
}
