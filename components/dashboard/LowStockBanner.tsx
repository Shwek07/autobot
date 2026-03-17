'use client';

import styles from './Dashboard.module.css';

interface LowStockBannerProps {
  count: number;
}

export default function LowStockBanner({ count }: LowStockBannerProps) {
  return (
    <div className={styles.alertBanner}>
      <span className={styles.alertIcon}>⚠️</span>
      <span className={styles.alertMessage}>
        {count} producten hebben een lage voorraad ({count < 5 ? 'dringend' : 'aandacht vereist'})
      </span>
      <button className={styles.alertClose}>×</button>
    </div>
  );
}