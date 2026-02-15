"use client";

import { useState, useEffect } from "react";
import styles from ".//product.module.css";

interface Product {
  product_id?: number;
  product_name: string;
  product_merk: string;
  part_number: string;
  description?: string;
  verkoop_prijs: number;
  stock_quantity: number;
}

export default function ProductsPage() {
  const [form, setForm] = useState<Product>({
    product_name: "",
    product_merk: "",
    part_number: "",
    description: "",
    verkoop_prijs: 0,
    stock_quantity: 0,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>(null);

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data);
    setFilteredProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let temp = [...products];
    
    // Apply search filter
    if (searchTerm) {
      temp = temp.filter((p) =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.part_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortConfig !== null) {
      temp.sort((a, b) => {
        if (a[sortConfig.key]! < b[sortConfig.key]!) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key]! > b[sortConfig.key]!) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredProducts(temp);
  }, [searchTerm, products, sortConfig]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === "number" 
      ? Number(e.target.value) 
      : e.target.value;
    
    setForm({
      ...form,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to create product");
    } else {
      alert("Product added successfully");
      setForm({
        product_name: "",
        product_merk: "",
        part_number: "",
        description: "",
        verkoop_prijs: 0,
        stock_quantity: 0,
      });
      fetchProducts();
    }

    setLoading(false);
  };

  const handleSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;

    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Delete failed");
        return;
      }

      // Remove from state immediately
      setProducts(prev => prev.filter(p => p.product_id !== id));
      // Also update filtered products to keep them in sync
      setFilteredProducts(prev => prev.filter(p => p.product_id !== id));
      alert("Product deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  const getSortIcon = (key: keyof Product) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '↕️';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { text: 'Out of Stock', class: styles.stockOut };
    if (quantity < 10) return { text: 'Low Stock', class: styles.stockLow };
    return { text: 'In Stock', class: styles.stockIn };
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📦 Add New Product</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="product_name">Product Name *</label>
            <input
              id="product_name"
              name="product_name"
              placeholder="e.g., Brake Pad Set, Oil Filter"
              value={form.product_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="product_merk">Brand *</label>
            <input
              id="product_merk"
              name="product_merk"
              placeholder="e.g., Bosch, Brembo"
              value={form.product_merk}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="part_number">Part Number *</label>
            <input
              id="part_number"
              name="part_number"
              placeholder="e.g., BP123, F026500123"
              value={form.part_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="verkoop_prijs">Price (€) *</label>
            <input
              id="verkoop_prijs"
              name="verkoop_prijs"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.verkoop_prijs}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="stock_quantity">Stock Quantity *</label>
            <input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min="0"
              placeholder="0"
              value={form.stock_quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fullWidth}>
            <div className={styles.inputGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Product description, features, compatibility..."
                value={form.description}
                onChange={handleChange}
                rows={3}
                className={styles.textarea}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? (
            <span className={styles.loadingSpinner}>⏳</span>
          ) : (
            "➕ Add Product"
          )}
        </button>
      </form>

      <div className={styles.list}>
        <div className={styles.listHeader}>
          <h2 className={styles.subtitle}>📋 Product Inventory</h2>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search products by name, brand, or part number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button 
                className={styles.clearSearch}
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className={styles.statsBar}>
          <span className={styles.statsItem}>
            📊 Total Products: {filteredProducts.length}
          </span>
          <span className={styles.statsItem}>
            💰 Total Value: {formatPrice(filteredProducts.reduce((sum, p) => sum + (p.verkoop_prijs * p.stock_quantity), 0))}
          </span>
        </div>

        <div className={styles.cardGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => {
              const stockStatus = getStockStatus(p.stock_quantity);
              return (
                <div key={p.product_id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <strong>{p.product_name}</strong>
                      <span className={styles.brand}>{p.product_merk}</span>
                    </div>

                    <div className={styles.cardActions}>
                      <span className={styles.badge}>{p.part_number}</span>
                      <button
                        onClick={() => handleDelete(p.product_id)}
                        className={styles.deleteButton}
                        title="Delete product"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.cardDetails}>
                    {p.description && (
                      <p className={styles.description}>📝 {p.description}</p>
                    )}
                    
                    <div className={styles.priceSection}>
                      <div className={styles.priceTag}>
                        <span className={styles.priceLabel}>Price</span>
                        <span className={styles.priceValue}>{formatPrice(p.verkoop_prijs)}</span>
                      </div>
                      
                      <div className={styles.stockSection}>
                        <span className={styles.priceLabel}>Stock</span>
                        <span className={`${styles.stockBadge} ${stockStatus.class}`}>
                          {stockStatus.text}: {p.stock_quantity}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.totalValue}>
                        Total value: {formatPrice(p.verkoop_prijs * p.stock_quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateContent}>
                <span className={styles.emptyIcon}>🔍</span>
                <p>{products.length === 0 ? 'No products added yet' : 'No products match your search'}</p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className={styles.emptyStateButton}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}