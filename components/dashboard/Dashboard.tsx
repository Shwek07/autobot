'use client';

import { useEffect, useState } from 'react';
import styles from './maindashboard.module.css';

interface Product {
  product_id: number;
  product_name: string;
  product_merk: string;
  verkoop_prijs: number;
  stock_quantity: number;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <div className={styles.loading}>Dashboard laden...</div>;

  const lowStock = products.filter(p => p.stock_quantity < 10);
  const recent = products.slice(0, 5);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <div className={styles.stats}>
        <Stat label="Producten" value={products.length} />
        <Stat label="Lage voorraad" value={lowStock.length} />
      </div>

      {lowStock.length > 0 && (
        <div className={styles.alert}>
          ⚠️ {lowStock.length} producten hebben lage voorraad
        </div>
      )}

      <div className={styles.card}>
        <h2>Recente Producten</h2>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Naam</th>
                <th>Merk</th>
                <th>Prijs</th>
                <th>Voorraad</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(p => (
                <tr key={p.product_id}>
                  <td>{p.product_name}</td>
                  <td>{p.product_merk}</td>
                  <td>€{p.verkoop_prijs}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        p.stock_quantity > 10
                          ? styles.ok
                          : p.stock_quantity > 0
                          ? styles.low
                          : styles.out
                      }`}
                    >
                      {p.stock_quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.stat}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
