import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <h2>💰 Planner</h2>

      <Link to="/grupos">Grupos</Link>
      <Link to="/perfil">Perfil</Link>
    </div>
  );
}