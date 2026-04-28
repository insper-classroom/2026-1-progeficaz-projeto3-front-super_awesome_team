import { Link } from "react-router-dom";
import { FaUsers, FaUser, FaCog } from "react-icons/fa";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.menu}>
        
        <Link to="/grupos" className={styles.item}>
          <FaUsers />
          <span>Grupos</span>
        </Link>

        <Link to="/perfil" className={styles.item}>
          <FaUser />
          <span>Perfil</span>
        </Link>

        <Link to="/configuracoes" className={styles.item}>
          <FaCog />
          <span>Config</span>
        </Link>

      </div>
    </div>
  );
}