import styles from "./Dashboard.module.css";

export default function Topbar() {
  return (
    <div className={styles.topbar}>
      <h3>Admin Dashboard</h3>
      <div className={styles.profile}>Admin</div>
    </div>
  );
}
