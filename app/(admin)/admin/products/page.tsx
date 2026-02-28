"use client";

import { useState, useEffect } from "react";
import styles from "./product.module.css";

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

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data);
    setFilteredProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products
  useEffect(() => {
    const temp = products.filter((p) =>
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.part_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(temp);
  }, [searchTerm, products]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
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
      alert(err.error || "Failed to add product");
    } else {
      alert("Product added successfully");
      setForm({ product_name: "", product_merk: "", part_number: "", description: "", verkoop_prijs: 0, stock_quantity: 0 });
      fetchProducts();
    }
    setLoading(false);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this product?")) return;

    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Delete failed");
      return;
    }
    setProducts(prev => prev.filter(p => p.product_id !== id));
    setFilteredProducts(prev => prev.filter(p => p.product_id !== id));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(price);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📦 Add New Product</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label>Product Name *</label>
            <input name="product_name" value={form.product_name} onChange={handleChange} placeholder="Brake Pad Set" required />
          </div>
          <div className={styles.inputGroup}>
            <label>Brand *</label>
            <input name="product_merk" value={form.product_merk} onChange={handleChange} placeholder="Bosch" required />
          </div>
          <div className={styles.inputGroup}>
            <label>Part Number *</label>
            <input name="part_number" value={form.part_number} onChange={handleChange} placeholder="BP123" required />
          </div>
          <div className={styles.inputGroup}>
            <label>Price (€) *</label>
            <input type="number" name="verkoop_prijs" value={form.verkoop_prijs} onChange={handleChange} min={0} step={0.01} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Stock Quantity *</label>
            <input type="number" name="stock_quantity" value={form.stock_quantity} onChange={handleChange} min={0} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Product description..." />
          </div>
        </div>
        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? "⏳ Adding..." : "➕ Add Product"}
        </button>
      </form>

      <div className={styles.list}>
        <div className={styles.listHeader}>
          <h2 className={styles.subtitle}>📋 Product Inventory</h2>
          <input
            className={styles.searchInput}
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.cardGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(p => (
              <div key={p.product_id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <strong>{p.product_name}</strong>
                  <span className={styles.badge}>{p.part_number}</span>
                </div>
                <div className={styles.cardDetails}>
                  <p>🛠 {p.product_merk}</p>
                  {p.description && <p>📝 {p.description}</p>}
                  <p>💰 {formatPrice(p.verkoop_prijs)}</p>
                  <p>📦 Stock: {p.stock_quantity}</p>
                  <button className={styles.deleteButton} onClick={() => handleDelete(p.product_id)}>🗑 Delete</button>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.emptyMessage}>No products found</p>
          )}
        </div>
      </div>
    </div>
  );
}