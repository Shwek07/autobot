'use client';

import { useState, useEffect } from 'react';
import './admin.css';

interface DashboardStats {
  totalProducts: number;
  totalCars: number;
  totalUsers: number;
  totalReservations: number;
  lowStockProducts: number;
  recentProducts: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCars: 0,
    totalUsers: 0,
    totalReservations: 0,
    lowStockProducts: 0,
    recentProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Haal alle data op voor het dashboard
      const [productsRes, carsRes, usersRes, reservationsRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/cars'),
        fetch('/api/admin/users'),
        fetch('/api/admin/reservations')
      ]);

      const products = await productsRes.json();
      const cars = await carsRes.json();
      const users = await usersRes.json();
      const reservations = await reservationsRes.json();

      setStats({
        totalProducts: products.length,
        totalCars: cars.length,
        totalUsers: users.length,
        totalReservations: reservations.length,
        lowStockProducts: products.filter((p: any) => p.stock_quantity < 10).length,
        recentProducts: products.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div>Dashboard laden...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '8px' }}>
          Welkom bij het Admin Dashboard
        </h2>
        <p style={{ color: '#64748b' }}>
          Hier vind je een overzicht van je webshop statistieken
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Totaal Producten</h3>
            <div className="stat-number">{stats.totalProducts}</div>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Onderdelen in assortiment</span>
          </div>
          <div className="stat-icon">🔧</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Totaal Auto's</h3>
            <div className="stat-number">{stats.totalCars}</div>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Auto modellen</span>
          </div>
          <div className="stat-icon">🚗</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Totaal Gebruikers</h3>
            <div className="stat-number">{stats.totalUsers}</div>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Geregistreerde klanten</span>
          </div>
          <div className="stat-icon">👥</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Actieve Reserveringen</h3>
            <div className="stat-number">{stats.totalReservations}</div>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Wachtende bestellingen</span>
          </div>
          <div className="stat-icon">📅</div>
        </div>
      </div>

      {/* Lage Voorraad Alert */}
      {stats.lowStockProducts > 0 && (
        <div style={{
          backgroundColor: '#fff3e0',
          border: '1px solid #ffb74d',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <strong style={{ color: '#ef6c00', fontSize: '16px' }}>
                {stats.lowStockProducts} product(en) hebben een lage voorraad!
              </strong>
              <p style={{ color: '#666', marginTop: '4px' }}>
                Bestel nieuwe voorraad voordat deze producten uitverkocht zijn.
              </p>
            </div>
          </div>
          <a 
            href="/admin/products?filter=lowstock"
            style={{
              backgroundColor: '#ef6c00',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            Bekijk producten
          </a>
        </div>
      )}

      {/* Recente Producten & Snelle Acties */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '24px',
        marginTop: '32px'
      }}>
        {/* Recente Producten Tabel */}
        <div className="table-container">
          <div style={{ 
            padding: '20px', 
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '18px', color: '#1e293b', margin: 0 }}>
              Recent Toegevoegde Producten
            </h3>
            <a 
              href="/admin/products"
              style={{ color: '#1a237e', textDecoration: 'none', fontSize: '14px' }}
            >
              Alle producten →
            </a>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Artikelnummer</th>
                <th>Prijs</th>
                <th>Voorraad</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentProducts.length > 0 ? (
                stats.recentProducts.map(product => (
                  <tr key={product.product_id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{product.product_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{product.product_merk}</div>
                    </td>
                    <td>{product.part_number}</td>
                    <td>€{product.verkoop_prijs?.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${
                        product.stock_quantity > 10 ? 'status-active' : 
                        product.stock_quantity > 0 ? 'status-low-stock' : 'status-inactive'
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Nog geen producten gevonden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Snelle Acties Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '20px' }}>
            Snelle Acties
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a 
              href="/admin/products"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                color: '#1e293b',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            >
              <span style={{ fontSize: '20px' }}>➕</span>
              <div>
                <div style={{ fontWeight: 500 }}>Nieuw product toevoegen</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Voeg een nieuw onderdeel toe</div>
              </div>
            </a>

            <a 
              href="/admin/cars"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                color: '#1e293b',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            >
              <span style={{ fontSize: '20px' }}>🚗</span>
              <div>
                <div style={{ fontWeight: 500 }}>Nieuw auto model</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Voeg een auto toe aan de database</div>
              </div>
            </a>

            <a 
              href="/admin/users"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                color: '#1e293b',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            >
              <span style={{ fontSize: '20px' }}>👤</span>
              <div>
                <div style={{ fontWeight: 500 }}>Nieuwe gebruiker</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Registreer een klant of admin</div>
              </div>
            </a>
          </div>

          {/* Systeem Status */}
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
              SYSTEEM STATUS
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '10px', 
                height: '10px', 
                backgroundColor: '#4caf50', 
                borderRadius: '50%',
                display: 'inline-block'
              }}></span>
              <span style={{ fontSize: '14px', color: '#1e293b' }}>
                Database verbinding actief
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
              Laatste update: {new Date().toLocaleTimeString('nl-NL')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}