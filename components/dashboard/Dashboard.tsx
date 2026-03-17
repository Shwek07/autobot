'use client';

import { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import RecentCarModels from '../carmodels/RecentCarModels';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import LowStockBanner from './LowStockBanner';
import RecentProductsTable from './RecentProductsTable';
import LowStockSection from './LowStockSection';

export interface Product {
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
  const [error, setError] = useState<string | null>(null);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/products', { cache: 'no-store' });

      if (!res.ok) throw new Error('Failed to fetch products');

      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Weet je zeker dat je dit product wilt verwijderen?')) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('Verwijderen mislukt');

      setProducts((prev) => prev.filter((p) => p.product_id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchProducts();

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString('nl-NL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Dashboard laden...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={fetchProducts}>Retry</button>
      </div>
    );
  }

  const lowStock = products.filter((p) => p.stock_quantity < 10);
  const totalItems = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);

  return (
    <div className={styles.dashboard}>
      <DashboardHeader currentTime={currentTime} onRefresh={fetchProducts} />

      <DashboardStats
        totalProducts={products.length}
        lowStockCount={lowStock.length}
        totalItems={totalItems}
      />

      {lowStock.length > 0 && <LowStockBanner count={lowStock.length} />}

      <RecentProductsTable
        products={products}
        onDelete={handleDelete}
      />

      <RecentCarModels />

      {lowStock.length > 0 && <LowStockSection products={lowStock} />}
    </div>
  );
}