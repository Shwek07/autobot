'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/products', icon: '🔧', label: 'Producten' },
    { path: '/admin/cars', icon: '🚗', label: 'Auto\'s' },
    { path: '/admin/users', icon: '👥', label: 'Gebruikers' },
    { path: '/admin/reservations', icon: '📅', label: 'Reserveringen' },
  ];

  return (
    <div className="admin-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>CarParts Admin</h2>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${pathname === item.path ? 'active' : ''}`}
            >
              <i>{item.icon}</i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link href="/login" className="logout-btn">
            <i>🚪</i>
            <span>Uitloggen</span>
          </Link>
        </div>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <h1 className="page-title">
            {navItems.find(item => item.path === pathname)?.label || 'Dashboard'}
          </h1>
          <div className="user-info">
            <span>Admin</span>
            <div className="user-avatar">A</div>
          </div>
        </div>
        
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}