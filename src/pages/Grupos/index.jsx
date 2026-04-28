import { useState } from "react";
import Card from "../../components/GrupoCard";
import styles from "./Grupos.module.css";
import Button from "../../components/Button";

export default function Grupos() {
  const [grupos, setGrupos] = useState([
    {
      nome: "Casa",
      valor: "R$ 1200",
      desc: "Contas",
      img: "/casa.jpg"
    },
    {
      nome: "Viagem",
      valor: "R$ 3000",
      desc: "Viagem para os EUA",
      img: "/viagem.jpg"
    },
    {
      nome: "Compras",
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

        <Button onClick={adicionarGrupo}>
          + Criar grupo
        </Button>
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