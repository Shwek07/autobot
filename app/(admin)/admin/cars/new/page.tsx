"use client";

import { useState, useEffect } from "react";
import styles from "./AutoModels.module.css";

interface AutoModel {
  auto_id?: number;
  auto_merk: string;
  auto_model: string;
  bouwjaar: number;
  engine_variant?: string;
  body_type?: string;
  vin?: string;
}

export default function AutoModelsPage() {
  const [form, setForm] = useState<AutoModel>({
    auto_merk: "",
    auto_model: "",
    bouwjaar: new Date().getFullYear(),
    engine_variant: "",
    body_type: "",
    vin: "",
  });

  const [models, setModels] = useState<AutoModel[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchModels = async () => {
    const res = await fetch("/api/admin/automodels");
    const data = await res.json();
    setModels(data);
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/automodels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to create auto model");
    } else {
      alert("Car model added successfully");
      setForm({
        auto_merk: "",
        auto_model: "",
        bouwjaar: new Date().getFullYear(),
        engine_variant: "",
        body_type: "",
        vin: "",
      });
      fetchModels();
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🚗 Add New Car Model</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="auto_merk">Brand *</label>
            <input
              id="auto_merk"
              name="auto_merk"
              placeholder="e.g., Toyota, BMW"
              value={form.auto_merk}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="auto_model">Model *</label>
            <input
              id="auto_model"
              name="auto_model"
              placeholder="e.g., Camry, X5"
              value={form.auto_model}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="bouwjaar">Year *</label>
            <input
              id="bouwjaar"
              name="bouwjaar"
              type="number"
              placeholder="Year"
              value={form.bouwjaar}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear() + 1}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="engine_variant">Engine Variant</label>
            <input
              id="engine_variant"
              name="engine_variant"
              placeholder="e.g., 2.0L Turbo, Electric"
              value={form.engine_variant}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="body_type">Body Type</label>
            <input
              id="body_type"
              name="body_type"
              placeholder="e.g., Sedan, SUV, Coupe"
              value={form.body_type}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="vin">VIN (optional)</label>
            <input
              id="vin"
              name="vin"
              placeholder="17-character VIN"
              value={form.vin}
              onChange={handleChange}
              maxLength={17}
            />
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
            "➕ Add Model"
          )}
        </button>
      </form>

      <div className={styles.list}>
        <h2 className={styles.subtitle}>📋 Existing Models</h2>
        <div className={styles.cardGrid}>
          {models.length > 0 ? (
            models.map((m) => (
              <div key={m.auto_id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <strong>
                    {m.auto_merk} {m.auto_model}
                  </strong>
                  <span className={styles.badge}>{m.bouwjaar}</span>
                </div>
                <div className={styles.cardDetails}>
                  {m.engine_variant && (
                    <p>⚙️ {m.engine_variant}</p>
                  )}
                  {m.body_type && (
                    <p>🚘 {m.body_type}</p>
                  )}
                  {m.vin && (
                    <p className={styles.vin}>🔑 {m.vin}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className={styles.emptyMessage}>No models added yet</p>
          )}
        </div>
      </div>
    </div>
  );
}