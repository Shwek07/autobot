"use client";

import styles from "./Dashboard.module.css";

export default function Topbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  return (
    <div className={styles.topbar}>
      <button className={styles.menuButton} onClick={onMenuClick}>
        ☰
      </button>

      <h3 className={styles.topbarTitle}>Admin Dashboard</h3>

      <div className={styles.profile}>Admin</div>
    </div>
  );
}