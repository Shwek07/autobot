'use client';

import styles from './Dashboard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

export default function StatCard({
  label,
  value,
  icon,
  color,
}: StatCardProps) {
  return (
    <div className={styles.statCard} style={{ borderLeftColor: color }}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statContent}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value ?? 0}</span>
      </div>
    </div>
  );
}