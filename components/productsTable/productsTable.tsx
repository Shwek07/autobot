'use client';

import { useEffect, useState } from 'react';
import styles from './productsTable.module.css';
import Link from 'next/dist/client/link';
import RecentCarModels from '../carmodels/RecentCarModels';

interface Product {
  product_id: number;
  product_name: string;
  product_merk: string;
  part_number: string;
  description: string;
  verkoop_prijs: number;
  stock_quantity: number;
}

export default function productsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  const [error, setError] = useState<string | null>(null);

 async function fetchProducts() {
  try {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/products", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await res.json();
    setProducts(data);
  } catch (err: any) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  fetchProducts();

  const updateTime = () => {
    const now = new Date();
    setCurrentTime(
      now.toLocaleString("nl-NL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  updateTime();
  const timer = setInterval(updateTime, 60000);

  return () => clearInterval(timer);
}, []);


  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p>Dashboard laden...</p>
    </div>
  );
if (error)
  return (
    <div className={styles.loadingContainer}>
      <p style={{ color: "red" }}>Error: {error}</p>
      <button onClick={fetchProducts}>Retry</button>
    </div>
  );

  const lowStock = products.filter(p => p.stock_quantity < 10);
  const outOfStock = products.filter(p => p.stock_quantity === 0);
  const totalValue = products.reduce(
  (sum, p) =>
    sum +
    Number(p.verkoop_prijs || 0) *
      Number(p.stock_quantity || 0),
  0
);
  
  // New statistics
  const averagePrice = products.length > 0 
    ? products.reduce((sum, p) => sum + p.verkoop_prijs, 0) / products.length 
    : 0;
  
  const totalItems = products.reduce((sum, p) => sum + p.stock_quantity, 0);
  const categories = [...new Set(products.map(p => p.product_merk))].length;

async function handleDelete(id: number) {
  if (!confirm("Weet je zeker dat je dit product wilt verwijderen?")) return;

  try {
    await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    // Optimistic update
    setProducts(prev => prev.filter(p => p.product_id !== id));
  } catch (err) {
    console.error(err);
  }
}



  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.date}>{currentTime}</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={fetchProducts}>
            <span>↻</span> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid - Top Row (3 cards) */}
      <div className={styles.statsGridTop}>
        <StatCard 
          label="Totaal Producten" 
          value={products.length} 
          icon="📦"
          color="#3b82f6"
        />
        <StatCard 
          label="Lage Voorraad" 
          value={lowStock.length} 
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
    


      {/* Alert Banner */}
      {lowStock.length > 0 && (
        <div className={styles.alertBanner}>
          <span className={styles.alertIcon}>⚠️</span>
          <span className={styles.alertMessage}>
            {lowStock.length} producten hebben een lage voorraad ({lowStock.length < 5 ? 'dringend' : 'aandacht vereist'})
          </span>
          <button className={styles.alertClose}>×</button>
        </div>
      )}

      {/* Recent Products Table - Full Width */}
      <div className={styles.fullWidthSection}>
        <div className={`${styles.card} ${styles.tableCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>🕒</span>
              Recente Producten
            </h2>
            <Link href="/admin/products/new">
              <button className={styles.viewAllButton}>Add New Product</button>
            </Link>
            <button className={styles.viewAllButton}>Bekijk alles →</button>
            
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Merk</th>
                  <th>Part Number</th>
                  <th>Voorraad</th>
                  <th>Prijs</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map(p => (
                  <tr key={p.product_id} className={styles.tableRow}>
                    <td>
                      <div className={styles.productInfo}>
                        <div className={styles.productAvatar}>
                          {p.product_name.charAt(0)}
                        </div>
                        <div>
                          <div className={styles.productName}>{p.product_name}</div>
                          <div className={styles.productDescription}>{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.brand}>{p.product_merk}</span>
                    </td>
                    <td>
                      <code className={styles.partNumber}>{p.part_number}</code>
                    </td>
                    <td>
                      <span
                        className={`${styles.stockBadge} ${
                          p.stock_quantity > 10
                            ? styles.stockOk
                            : p.stock_quantity > 5
                            ? styles.stockLow
                            : p.stock_quantity > 0
                            ? styles.stockCritical
                            : styles.stockOut
                        }`}
                      >
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className={styles.price}>
                      €{Number(p.verkoop_prijs).toFixed(2)}
                    </td>
                    <td>
                      <span className={`${styles.status} ${
                        p.stock_quantity > 10 ? styles.statusActive : styles.statusWarning
                      }`}>
                        {p.stock_quantity > 10 ? 'Actief' : 'Attention'}
                      </span>
                    </td>
                    <td>
                    <button
                      onClick={() => handleDelete(p.product_id)}
                      className={styles.deleteButton}
                    >
                      🗑
                    </button>
                  </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RecentCarModels />

      {/* Low Stock Section - Only show if there are items with low stock */}
      {lowStock.length > 0 && (
        <div className={styles.fullWidthSection}>
          <div className={`${styles.card} ${styles.lowStockCard}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <span className={styles.cardIcon}>📉</span>
                Lage Voorraad Alert
              </h2>
            </div>
            <div className={styles.lowStockGrid}>
              {lowStock.slice(0, 6).map(p => (
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
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className={styles.statCard} style={{ borderLeftColor: color }}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statContent}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
      </div>
    </div>
  );
}