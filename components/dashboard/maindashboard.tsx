// app/admin/maindashboard.tsx
'use client';

import { useState } from 'react';
// import DashboardOverview from './components/DashboardOverview';
// import ProductManagement from './components/ProductManagement';
// import AutoModelManagement from './components/AutoModelManagement';
import styles from './maindashboard.module.css';

type Tab = 'overview' | 'products' | 'automodels' | 'reservations' | 'users';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const navigation = [
    { id: 'overview', label: 'Overzicht', icon: '📊' },
    { id: 'products', label: 'Producten', icon: '📦' },
    { id: 'automodels', label: 'Auto Modellen', icon: '🚗' },
    { id: 'reservations', label: 'Reserveringen', icon: '📅' },
    { id: 'users', label: 'Gebruikers', icon: '👥' },
  ];

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: 0, color: '#2563eb' }}>AutoParts</h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Admin Panel</p>
        </div>
        
        <nav className={styles.nav}>
          {navigation.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            >
              <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        {/* {activeTab === 'overview' && <DashboardOverview />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'automodels' && <AutoModelManagement />}
        {activeTab === 'reservations' && <ReservationManagement />}
        {activeTab === 'users' && <UserManagement />} */}
      </main>
    </div>
  );
}