"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./NewProduct.module.css";

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    product_name: "",
    product_merk: "",
    part_number: "",
    description: "",
    verkoop_prijs: "",
    stock_quantity: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        verkoop_prijs: Number(form.verkoop_prijs),
        stock_quantity: Number(form.stock_quantity),
      }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      alert("Failed to create product");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create New Product</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Product Name</label>
            <input
              name="product_name"
              className={styles.input}
              value={form.product_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Brand</label>
            <input
              name="product_merk"
              className={styles.input}
              value={form.product_merk}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Part Number</label>
            <input
              name="part_number"
              className={styles.input}
              value={form.part_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              name="description"
              className={styles.textarea}
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Price (€)</label>
            <input
              name="verkoop_prijs"
              type="number"
              step="0.01"
              className={styles.input}
              value={form.verkoop_prijs}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Stock Quantity</label>
            <input
              name="stock_quantity"
              type="number"
              className={styles.input}
              value={form.stock_quantity}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.button}>
            Create Product
          </button>
        </form>
      </div>
    </div>
  );
}
