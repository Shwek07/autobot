'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './Dashboard.module.css';
import type { Product } from './Dashboard';

interface RecentProductsTableProps {
  products: Product[];
  onDelete: (id: number) => void;
}

const ROWS_PER_PAGE = 10;

type SortKey =
  | 'product_name'
  | 'product_merk'
  | 'part_number'
  | 'stock_quantity'
  | 'verkoop_prijs';

export default function RecentProductsTable({
  products,
  onDelete,
}: RecentProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: 'asc' | 'desc';
  } | null>(null);

  const filteredAndSorted = useMemo(() => {
    let temp = [...products];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();

      temp = temp.filter((p) =>
        [
          p.product_name,
          p.product_merk,
          p.part_number,
          p.description,
          String(p.stock_quantity),
          String(p.verkoop_prijs),
          String(p.product_id),
        ].some((value) => value.toLowerCase().includes(term))
      );
    }

    if (sortConfig) {
      temp.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return temp;
  }, [products, searchTerm, sortConfig]);

  const totalItems = products.length;
  const totalPages = Math.ceil(filteredAndSorted.length / ROWS_PER_PAGE);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    return filteredAndSorted.slice(start, end);
  }, [filteredAndSorted, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  const clearFilters = () => {
    setSearchTerm('');
    setSortConfig(null);
    setCurrentPage(1);
  };

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '↕';
  };

  const getStockClass = (stock: number) => {
    if (stock > 10) return styles.stockOk;
    if (stock > 5) return styles.stockLow;
    if (stock > 0) return styles.stockCritical;
    return styles.stockOut;
  };

  const getStatusText = (stock: number) => {
    if (stock > 10) return 'Actief';
    if (stock > 0) return 'Attention';
    return 'Uitverkocht';
  };

  const getStatusClass = (stock: number) => {
    return stock > 10 ? styles.statusActive : styles.statusWarning;
  };

  return (
    <div className={styles.fullWidthSection}>
      <div className={`${styles.card} ${styles.tableCard}`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <span className={styles.cardIcon}>🕒</span> Recente Producten
            <span className={styles.count}>{totalItems}</span>
          </h2>

          <div className={styles.headerButtons}>
          <Link href="/admin/products">
            <button className={styles.viewAllButton}>+ Add Products </button>
          </Link>

          <Link href="/admin/products/">
            <button className={styles.viewAllButton}>Bekijk alles →</button>
          </Link>
        </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Zoek op product, merk, part number, beschrijving, prijs..."
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
                <th
                  onClick={() => handleSort('product_name')}
                  className={styles.sortable}
                >
                  Product {getSortIcon('product_name')}
                </th>
                <th
                  onClick={() => handleSort('product_merk')}
                  className={styles.sortable}
                >
                  Merk {getSortIcon('product_merk')}
                </th>
                <th
                  onClick={() => handleSort('part_number')}
                  className={styles.sortable}
                >
                  Part Number {getSortIcon('part_number')}
                </th>
                <th
                  onClick={() => handleSort('stock_quantity')}
                  className={styles.sortable}
                >
                  Voorraad {getSortIcon('stock_quantity')}
                </th>
                <th
                  onClick={() => handleSort('verkoop_prijs')}
                  className={styles.sortable}
                >
                  Prijs {getSortIcon('verkoop_prijs')}
                </th>
                <th>Status</th>
                <th>Acties</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((p) => (
                  <tr key={p.product_id}>
                    <td>
                      <div className={styles.productInfo}>
                        <div className={styles.productAvatar}>
                          {p.product_name.charAt(0)}
                        </div>
                        <div>
                          <div className={styles.productName}>{p.product_name}</div>
                          <div className={styles.productDescription}>
                            {p.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>{p.product_merk}</td>

                    <td>
                      <code className={styles.partNumber}>{p.part_number}</code>
                    </td>

                    <td>
                      <span
                        className={`${styles.stockBadge} ${getStockClass(
                          p.stock_quantity
                        )}`}
                      >
                        {p.stock_quantity}
                      </span>
                    </td>

                    <td>SRD {p.verkoop_prijs.toFixed(2)}</td>

                    <td className={getStatusClass(p.stock_quantity)}>
                      {getStatusText(p.stock_quantity)}
                    </td>

                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => onDelete(p.product_id)}
                          className={styles.deleteButton}
                        >
                          🗑
                        </button>

                        <Link
                          href={`/admin/products/${p.product_id}`}
                          className={styles.updateButton}
                        >
                          ✏️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    <div className={styles.emptyStateContent}>
                      <span className={styles.emptyIcon}>🔍</span>
                      <p>Geen resultaten gevonden</p>
                      <button
                        onClick={clearFilters}
                        className={styles.emptyStateButton}
                      >
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
              Pagina <strong>{currentPage}</strong> van{' '}
              <strong>{totalPages}</strong>
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Volgende →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}