'use client';

import styles from './Dashboard.module.css';
import StatCard from './StatCard';

interface DashboardStatsProps {
  totalProducts: number;
  lowStockCount: number;
  totalItems: number;
}

export default function DashboardStats({
  totalProducts,
  lowStockCount,
  totalItems,
}: DashboardStatsProps) {
  return (
    <div className={styles.statsGridTop}>
      <StatCard
        label="Totaal Producten"
        value={totalProducts}
        icon="📦"
        color="#3b82f6"
      />
      <StatCard
        label="Lage Voorraad"
        value={lowStockCount}
        icon="⚠️"
        color="#f59e0b"
      />
      <StatCard
        label="Totaal Artikelen"
        value={totalItems.toLocaleString('nl-NL')}
        icon="📊"
        color="#ec4899"
      />
    </div>
  );
}