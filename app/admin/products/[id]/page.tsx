"use client";
import styles from "./NewProducts.module.css";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface Product {
  product_id: number;
  product_name: string;
  product_merk: string;
  part_number: string;
  description: string;
  verkoop_prijs: number;
  stock_quantity: number;
}

export default function UpdateProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Product>({
    product_id: 0,
    product_name: "",
    product_merk: "",
    part_number: "",
    description: "",
    verkoop_prijs: 0,
    stock_quantity: 0,
  });

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`/api/admin/products/${id}`);
      const data = await res.json();
      setForm(data);
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`/api/admin/products/${form.product_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      alert("Failed to update product");
    }
  };

  if (loading) {
    return (
      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>Loading product...</h2>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.formTitle}>Update Product</h1>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        
        <label>
          Product Name
          <input
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Brand
          <input
            name="product_merk"
            value={form.product_merk}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Part Number
          <input
            name="part_number"
            value={form.part_number}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <label>
          Price
          <input
            name="verkoop_prijs"
            type="number"
            step="0.01"
            value={form.verkoop_prijs}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Stock Quantity
          <input
            name="stock_quantity"
            type="number"
            value={form.stock_quantity}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className={styles.submitButton}>
          Update Product
        </button>

      </form>
    </div>
  );
}
