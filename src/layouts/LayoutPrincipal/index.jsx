import Sidebar from "../../components/Sidebar";
import styles from "./LayoutPrincipal.module.css";

export default function LayoutPrincipal({ children }) {
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>{children}</div>
    </div>
  );
}