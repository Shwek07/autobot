'use client';

import { useEffect, useState } from "react";
import styles from "./RecentCarModels.module.css";
import Link from "next/link";

interface AutoModel {
  auto_id: number;
  auto_merk: string;
  auto_model: string;
  bouwjaar: number;
  engine_variant?: string;
  body_type?: string;
  vin?: string;
}

export default function RecentCarModels() {
  const [models, setModels] = useState<AutoModel[]>([]);
  const [filtered, setFiltered] = useState<AutoModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ merk: "", bouwjaar: "" });
  const [sortConfig, setSortConfig] = useState<{ key: keyof AutoModel; direction: 'asc' | 'desc' } | null>(null);

  async function fetchModels() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/automodels?limit=10", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch car models");
      const data = await res.json();
      setModels(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    let temp = [...models];
    
    // Apply filters
    if (search.merk) {
      temp = temp.filter((m) =>
        m.auto_merk.toLowerCase().includes(search.merk.toLowerCase())
      );
    }
    if (search.bouwjaar) {
      temp = temp.filter((m) => m.bouwjaar === Number(search.bouwjaar));
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
    
    setFiltered(temp);
  }, [search, models, sortConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSort = (key: keyof AutoModel) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setSearch({ merk: "", bouwjaar: "" });
    setSortConfig(null);
  };

  const getSortIcon = (key: keyof AutoModel) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '↕️';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Laden...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>🚗</span>
          Recente Auto Modellen
        </h2>
         <Link href="/admin/cars/">
              <button className={styles.viewAllButton}>Bekijk alle auto's </button>
            </Link>
        <span className={styles.count}>{filtered.length} modellen</span>
      </div>

      {/* Filter Section */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            name="merk"
            placeholder="Zoek op merk..."
            value={search.merk}
            onChange={handleChange}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.yearWrapper}>
          <input
            name="bouwjaar"
            type="number"
            placeholder="Bouwjaar"
            value={search.bouwjaar}
            onChange={handleChange}
            className={styles.yearInput}
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
        {(search.merk || search.bouwjaar || sortConfig) && (
          <button onClick={clearFilters} className={styles.clearButton}>
            ✖ Wissen
          </button>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('auto_merk')} className={styles.sortable}>
                Merk {getSortIcon('auto_merk')}
              </th>
              <th onClick={() => handleSort('auto_model')} className={styles.sortable}>
                Model {getSortIcon('auto_model')}
              </th>
              <th onClick={() => handleSort('bouwjaar')} className={styles.sortable}>
                Bouwjaar {getSortIcon('bouwjaar')}
              </th>
              <th onClick={() => handleSort('engine_variant')} className={styles.sortable}>
                Engine {getSortIcon('engine_variant')}
              </th>
              <th onClick={() => handleSort('body_type')} className={styles.sortable}>
                Body Type {getSortIcon('body_type')}
              </th>
              <th>VIN</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((m, index) => (
                <tr key={m.auto_id} className={styles.row}>
                  <td className={styles.merkCell}>
                    <span className={styles.merkBadge}>{m.auto_merk}</span>
                  </td>
                  <td className={styles.modelCell}>{m.auto_model}</td>
                  <td>
                    <span className={styles.yearBadge}>{m.bouwjaar}</span>
                  </td>
                  <td>{m.engine_variant || <span className={styles.emptyValue}>-</span>}</td>
                  <td>{m.body_type || <span className={styles.emptyValue}>-</span>}</td>
                  <td className={styles.vinCell}>
                    {m.vin ? (
                      <span className={styles.vin} title={m.vin}>
                        {m.vin.substring(0, 8)}...
                      </span>
                    ) : (
                      <span className={styles.emptyValue}>-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  <div className={styles.emptyStateContent}>
                    <span className={styles.emptyIcon}>🔍</span>
                    <p>Geen resultaten gevonden</p>
                    <button onClick={clearFilters} className={styles.emptyStateButton}>
                      Wis filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}