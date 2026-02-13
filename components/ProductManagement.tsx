// app/admin/components/ProductManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from '../maindashboard.module.css';

interface Category {
  category_id: number;
  category_name: string;
}

interface Product {
  product_id: number;
  product_name: string;
  product_merk: string;
  part_number: string;
  sku: string;
  description: string;
  verkoop_prijs: number;
  inkoop_prijs: number;
  stock_quantity: number;
  is_active: boolean;
  category_name?: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    product_name: '',
    product_merk: '',
    part_number: '',
    sku: '',
    description: '',
    category_id: '',
    verkoop_prijs: '',
    inkoop_prijs: '',
    stock_quantity: '',
    is_active: '1'
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Fout bij laden producten:', error);
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Fout bij laden categorieën:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Product succesvol toegevoegd!' });
        setFormData({
          product_name: '', product_merk: '', part_number: '', sku: '',
          description: '', category_id: '', verkoop_prijs: '', inkoop_prijs: '',
          stock_quantity: '', is_active: '1'
        });
        setShowForm(false);
        loadProducts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Er is een fout opgetreden' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Verbinding mislukt' });
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product_merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.part_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Productbeheer</h1>
        <button onClick={() => setShowForm(!showForm)} className={styles.button}>
          {showForm ? 'Annuleren' : '+ Nieuw Product'}
        </button>
      </div>

      {message.text && (
        <div className={message.type === 'success' ? styles.success : styles.error}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className={styles.card} style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Nieuw product toevoegen</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Productnaam *</label>
              <input
                required
                value={formData.product_name}
                onChange={e => setFormData({...formData, product_name: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Merk *</label>
              <input
                required
                value={formData.product_merk}
                onChange={e => setFormData({...formData, product_merk: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Onderdeelnummer *</label>
              <input
                required
                value={formData.part_number}
                onChange={e => setFormData({...formData, part_number: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>SKU</label>
              <input
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Categorie *</label>
              <select
                required
                value={formData.category_id}
                onChange={e => setFormData({...formData, category_id: e.target.value})}
              >
                <option value="">Selecteer categorie</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Beschrijving</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label>Verkoopprijs (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.verkoop_prijs}
                  onChange={e => setFormData({...formData, verkoop_prijs: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Inkoopprijs (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.inkoop_prijs}
                  onChange={e => setFormData({...formData, inkoop_prijs: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label>Voorraad *</label>
                <input
                  type="number"
                  required
                  value={formData.stock_quantity}
                  onChange={e => setFormData({...formData, stock_quantity: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.value})}
                >
                  <option value="1">Actief</option>
                  <option value="0">Inactief</option>
                </select>
              </div>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Bezig met opslaan...' : 'Product opslaan'}
            </button>
          </form>
        </div>
      )}

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Zoek op naam, merk of onderdeelnummer..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.productGrid}>
        {filteredProducts.map(product => (
          <div key={product.product_id} className={styles.productCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <h3>{product.product_name}</h3>
              <span className={`${styles.statusBadge} ${product.is_active ? styles.statusActive : styles.statusInactive}`}>
                {product.is_active ? 'Actief' : 'Inactief'}
              </span>
            </div>
            
            <div className={styles.productMeta}>
              <div>Merk: {product.product_merk}</div>
              <div>Onderdeel: {product.part_number}</div>
              {product.sku && <div>SKU: {product.sku}</div>}
              {product.category_name && <div>Categorie: {product.category_name}</div>}
            </div>

            <div className={styles.productPrice}>
              €{product.verkoop_prijs?.toFixed(2)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span className={`${styles.badge} ${
                product.stock_quantity > 10 ? styles.ok :
                product.stock_quantity > 0 ? styles.low : styles.out
              }`}>
                Voorraad: {product.stock_quantity}
              </span>
              
              <button className={styles.button} style={{ padding: '0.5rem 1rem' }}>
                Bewerk
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Geen producten gevonden
        </div>
      )}
    </div>
  );
}