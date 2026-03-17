'use client';

import { useEffect, useMemo, useState } from "react";
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

const ROWS_PER_PAGE = 10;

export default function RecentCarModels() {
  const [models, setModels] = useState<AutoModel[]>([]);
  const [loading, setLoading] = useState(true);
  const totalItems = models.length;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AutoModel;
    direction: "asc" | "desc";
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  async function fetchModels() {
    try {
      setLoading(true);

      // IMPORTANT:
      // remove ?limit=10 so you can paginate on the frontend
      const res = await fetch("/api/admin/automodels", { cache: "no-store" });

      if (!res.ok) throw new Error("Failed to fetch car models");

      const data = await res.json();
      setModels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchModels();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let temp = [...models];

    // Search across all relevant fields
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();

      temp = temp.filter((m) =>
        [
          m.auto_merk,
          m.auto_model,
          String(m.bouwjaar),
          m.engine_variant ?? "",
          m.body_type ?? "",
          m.vin ?? "",
          String(m.auto_id),
        ].some((value) => value.toLowerCase().includes(term))
      );
    }

    // Sorting
    if (sortConfig) {
      temp.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return temp;
  }, [models, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSorted.length / ROWS_PER_PAGE);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    return filteredAndSorted.slice(startIndex, endIndex);
  }, [filteredAndSorted, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  const handleSort = (key: keyof AutoModel) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortConfig(null);
    setCurrentPage(1);
  };

  const getSortIcon = (key: keyof AutoModel) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === "asc" ? "↑" : "↓";
    }
    return "↕";
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
          <span className={styles.count}>{totalItems}</span>
          
          Recente Auto Modellen
        </h2>

        <div className={styles.headerButtons}>
          <Link href="/admin/cars/new">
            <button className={styles.viewAllButton}>+ Add new car</button>
          </Link>

          <Link href="/admin/cars/">
            <button className={styles.viewAllButton}>Bekijk alles →</button>
          </Link>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Zoek op merk, model, bouwjaar, engine, body type, VIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {(searchTerm || sortConfig) && (
          <button onClick={clearFilters} className={styles.clearButton}>
            ✖ Wissen
          </button>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort("auto_merk")} className={styles.sortable}>
                Merk {getSortIcon("auto_merk")}
              </th>
              <th onClick={() => handleSort("auto_model")} className={styles.sortable}>
                Model {getSortIcon("auto_model")}
              </th>
              <th onClick={() => handleSort("bouwjaar")} className={styles.sortable}>
                Bouwjaar {getSortIcon("bouwjaar")}
              </th>
              <th onClick={() => handleSort("engine_variant")} className={styles.sortable}>
                Engine {getSortIcon("engine_variant")}
              </th>
              <th onClick={() => handleSort("body_type")} className={styles.sortable}>
                Body Type {getSortIcon("body_type")}
              </th>
              <th onClick={() => handleSort("vin")} className={styles.sortable}>
                VIN {getSortIcon("vin")}
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((m) => (
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
                        {m.vin.length > 8 ? `${m.vin.substring(0, 8)}...` : m.vin}
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

      {filteredAndSorted.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Pagina <strong>{currentPage}</strong> van <strong>{totalPages}</strong>
          </div>

          <div className={styles.paginationButtons}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Vorige
            </button>

            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Volgende →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}