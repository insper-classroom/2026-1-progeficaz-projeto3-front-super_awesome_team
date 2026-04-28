import { useState } from "react";
import Card from "../../components/Card";
import styles from "./Grupos.module.css";

export default function Grupos() {
  const [grupos, setGrupos] = useState([
    {
      nome: "Casa & casamento",
      valor: "R$ 1200",
      desc: "Despesas da casa",
      img: "/casa.jpg"
    },
    {
      nome: "Viagem Europa",
      valor: "R$ 3000",
      desc: "Viagem internacional",
      img: "/viagem.jpg"
    },
    {
      nome: "Mercado",
      valor: "R$ 800",
      desc: "Compras do mês",
      img: "/mercado.jpg"
    },
    {
      nome: "Estudos",
      valor: "R$ 500",
      desc: "Cursos e materiais",
      img: "/estudo.jpg"
    }
  ]);

  function adicionarGrupo() {
    const nome = prompt("Nome do grupo:");
    if (!nome) return;

    setGrupos([
      ...grupos,
      {
        nome,
        valor: "R$ 0",
        desc: "Novo grupo",
        img: "/casa.jpg"
      }
    ]);
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>Grupos</h1>
          <p>Organize suas despesas em grupo</p>
        </div>

        <button onClick={adicionarGrupo}>
          + Criar grupo
        </button>
      </div>

      <div className={styles.grid}>
        {grupos.map((g, i) => (
          <Card
            key={i}
            title={g.nome}
            value={g.valor}
            subtitle={g.desc}
            image={g.img}
          />
        ))}
      </div>
    </div>
  );
}