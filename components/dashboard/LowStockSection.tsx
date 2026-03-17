'use client';

import styles from './Dashboard.module.css';
import type { Product } from './Dashboard';

interface LowStockSectionProps {
  products: Product[];
}

export default function LowStockSection({
  products,
}: LowStockSectionProps) {
  return (
    <div className={styles.lowStockSectionHeader}>
      <div className={styles.fullWidthSection}>
        <div className={`${styles.card} ${styles.lowStockCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>📉</span> Lage Voorraad Alert
            </h2>
          </div>

          <div className={styles.lowStockGrid}>
            {products.slice(0, 6).map((p) => (
              <div key={p.product_id} className={styles.lowStockItem}>
                <div className={styles.lowStockInfo}>
                  <span className={styles.lowStockName}>{p.product_name}</span>
                  <span className={styles.lowStockMerk}>{p.product_merk}</span>
                </div>
                <div className={styles.lowStockValue}>
                  <span className={`${styles.stockBadge} ${styles.stockCritical}`}>
                    {p.stock_quantity}
                  </span>
                  <button className={styles.orderButton}>Bestel</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}