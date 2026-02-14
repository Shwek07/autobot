'use client';

import { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';

interface Product {
  product_id: number;
  product_name: string;
  product_merk: string;
  part_number: string;
  description: string;
  verkoop_prijs: number;
  stock_quantity: number;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

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

    // Set current time
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('nl-NL', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 60000); // Update every minute
    
    loadData();

    return () => clearInterval(timer);
  }, []);

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p>Dashboard laden...</p>
    </div>
  );

  const lowStock = products.filter(p => p.stock_quantity < 10);
  const outOfStock = products.filter(p => p.stock_quantity === 0);
  const totalValue = products.reduce((sum, p) => sum + (p.verkoop_prijs * p.stock_quantity), 0);
  
  // New statistics
  const averagePrice = products.length > 0 
    ? products.reduce((sum, p) => sum + p.verkoop_prijs, 0) / products.length 
    : 0;
  
  const totalItems = products.reduce((sum, p) => sum + p.stock_quantity, 0);
  const categories = [...new Set(products.map(p => p.product_merk))].length;

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.date}>{currentTime}</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={() => window.location.reload()}>
            <span>↻</span> Verversen
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
          label="Uitverkocht" 
          value={outOfStock.length} 
          icon="❌"
          color="#ef4444"
        />
      </div>

      {/* Stats Grid - Bottom Row (3 cards) */}
      <div className={styles.statsGridBottom}>
        <StatCard 
          label="Voorraad Waarde" 
          value={`€${totalValue.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon="💰"
          color="#10b981"
        />
        <StatCard 
          label="Gemiddelde Prijs" 
          value={`€${averagePrice.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon="🏷️"
          color="#8b5cf6"
        />
        <StatCard 
          label="Totaal Artikelen" 
          value={totalItems.toLocaleString('nl-NL')} 
          icon="📊"
          color="#ec4899"
        />
      </div>

      {/* Optional: Categories Card - You can add this as a 7th card or replace one */}
      {/* <div className={styles.statsGridBottom}>
        <StatCard 
          label="Merken" 
          value={categories} 
          icon="🏭"
          color="#14b8a6"
        />
      </div> */}

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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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