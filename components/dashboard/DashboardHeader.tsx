'use client';

import styles from './Dashboard.module.css';

interface DashboardHeaderProps {
  currentTime: string;
  onRefresh: () => void;
}

export default function DashboardHeader({
  currentTime,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>Welcome terug!</h1>
        <p className={styles.date}>{currentTime}</p>
      </div>

      <div className={styles.headerActions}>
        <button className={styles.refreshButton} onClick={onRefresh}>
          <span>↻</span> Refresh
        </button>
      </div>
    </div>
  );
}