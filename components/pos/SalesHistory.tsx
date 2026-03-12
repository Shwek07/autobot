// components/pos/SalesHistory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  FiShoppingBag,
  FiCalendar,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiPackage,
  FiTrendingUp,
  FiClock,
  FiDownload,
  FiEye
} from 'react-icons/fi';
import { getSalesHistory, getSalesStats } from '@/app/actions/sales';
import styles from './saleshistory.module.css';

interface SaleItem {
  product_id: number;
  product_name: string;
  product_merk: string;
  quantity: number;
  price_at_sale: number;
  part_number?: string;
}

interface Sale {
  order_id: number;
  total_amount: number;
  payment_method: string;
  created_at: string;
  total_items: number;
  items: SaleItem[];
}

interface SalesStats {
  total_orders: number;
  total_revenue: number;
  average_order: number;
  active_days: number;
}

interface Props {
  initialStats?: SalesStats;
}

export default function SalesHistory({ initialStats }: Props) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(initialStats || null);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadSales = async () => {
    setLoading(true);
    try {
      const result = await getSalesHistory(
        currentPage,
        20,
        searchTerm,
        startDate || undefined,
        endDate || undefined,
        paymentMethod !== 'all' ? paymentMethod : undefined
      );

      setSales(result.sales);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);

      // Laad stats als ze niet zijn meegegeven
      if (!stats) {
        const statsResult = await getSalesStats(startDate || undefined, endDate || undefined);
        setStats(statsResult);
      }
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, startDate, endDate, paymentMethod]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'SRD'
    }).format(amount);
  };

  const getPaymentMethodClass = (method: string) => {
    switch (method) {
      case 'contant':
        return styles.methodContant;
      case 'pin':
        return styles.methodPin;
      case 'ideal':
        return styles.methodIdeal;
      case 'creditcard':
        return styles.methodCreditcard;
      default:
        return '';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'contant':
        return '💰';
      case 'pin':
        return '💳';
      case 'ideal':
        return '🏦';
      case 'creditcard':
        return '💳';
      default:
        return '💵';
    }
  };

  const handleExport = () => {
    // Exporteer naar CSV
    const csv = sales
      .map((sale) => {
        return `${sale.order_id},${formatDate(sale.created_at)},${sale.payment_method},${sale.total_amount},${sale.total_items}`;
      })
      .join('\n');

    const blob = new Blob([`Order ID,Datum,Betaling,Totaal,Items\n${csv}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading && sales.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Verkochte items laden...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FiShoppingBag />
          Verkochte Items
        </h2>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Zoek op order ID, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.dateFilter}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
              placeholder="Van"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
              placeholder="Tot"
            />
          </div>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Alle betalingen</option>
            <option value="contant">Contant</option>
            <option value="pin">Pin</option>
            <option value="ideal">iDEAL</option>
            <option value="creditcard">Creditcard</option>
          </select>

          <button onClick={handleExport} className={styles.paginationButton}>
            <FiDownload />
            Exporteer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiShoppingBag />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Totaal orders</p>
              <p className={styles.statValue}>{stats.total_orders}</p>
              <p className={styles.statSubValue}>laatste periode</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiDollarSign />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Totale omzet</p>
              <p className={styles.statValue}>{formatCurrency(stats.total_revenue)}</p>
              <p className={styles.statSubValue}>incl. BTW</p>
            </div>
          </div>
        </div>
      )}

      {/* Sales Table */}
      {sales.length === 0 ? (
        <div className={styles.emptyState}>
          <FiShoppingBag size={48} />
          <p>Geen verkochte items gevonden</p>
          <p className={styles.emptyStateSmall}>Pas je filters aan of voeg nieuwe verkopen toe</p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.salesTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Datum & Tijd</th>
                  <th>Producten</th>
                  <th>Betaling</th>
                  <th>Totaal</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <React.Fragment key={sale.order_id}>
                    <tr
                      onClick={() => toggleOrderDetails(sale.order_id)}
                      className={expandedOrder === sale.order_id ? styles.expanded : ''}
                    >
                      <td>
                        <span className={styles.orderId}>
                          #{sale.order_id.toString().padStart(6, '0')}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FiClock style={{ color: '#999' }} />
                          {formatDate(sale.created_at)}
                        </div>
                      </td>

                      <td>{sale.total_items} items</td>

                      <td>
                        <span
                          className={`${styles.paymentMethod} ${getPaymentMethodClass(
                            sale.payment_method
                          )}`}
                        >
                          {getPaymentMethodIcon(sale.payment_method)} {sale.payment_method}
                        </span>
                      </td>

                      <td>{formatCurrency(sale.total_amount)}</td>

                      <td>
                        <FiEye style={{ color: '#667eea', cursor: 'pointer' }} />
                      </td>
                    </tr>

                    {expandedOrder === sale.order_id && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={6}>
                          <div className={styles.detailsContainer}>
                            <div className={styles.detailsHeader}>
                              <h4 className={styles.detailsTitle}>
                                <FiPackage />
                                Order details #{sale.order_id.toString().padStart(6, '0')}
                              </h4>
                              <button
                                onClick={() => setExpandedOrder(null)}
                                className={styles.closeDetails}
                              >
                                <FiX />
                              </button>
                            </div>

                            <div className={styles.detailsGrid}>
                              <div className={styles.detailItem}>
                                <p className={styles.detailLabel}>Orderdatum</p>
                                <p className={styles.detailValue}>
                                  {new Date(sale.created_at).toLocaleString('nl-NL')}
                                </p>
                              </div>

                              <div className={styles.detailItem}>
                                <p className={styles.detailLabel}>Betaalmethode</p>
                                <p className={styles.detailValue}>
                                  <span
                                    className={`${styles.paymentMethod} ${getPaymentMethodClass(
                                      sale.payment_method
                                    )}`}
                                  >
                                    {getPaymentMethodIcon(sale.payment_method)} {sale.payment_method}
                                  </span>
                                </p>
                              </div>

                              <div className={styles.detailItem}>
                                <p className={styles.detailLabel}>Totaalbedrag</p>
                                <p className={`${styles.detailValue} ${styles.detailValueLarge}`}>
                                  {formatCurrency(sale.total_amount)}
                                </p>
                              </div>

                              <div className={styles.detailItem}>
                                <p className={styles.detailLabel}>Aantal items</p>
                                <p className={styles.detailValue}>{sale.total_items}</p>
                              </div>
                            </div>

                            <table className={styles.detailsItemsTable}>
                              <thead>
                                <tr>
                                  <th>Product</th>
                                  <th>Merk</th>
                                  <th>Art. nr.</th>
                                  <th>Aantal</th>
                                  <th>Prijs</th>
                                  <th>Totaal</th>
                                </tr>
                              </thead>

                              <tbody>
                                {sale.items.map((item) => (
                                  <tr key={`${sale.order_id}-${item.product_id}`}>
                                    <td>{item.product_name}</td>
                                    <td>{item.product_merk}</td>
                                    <td>{item.part_number || '-'}</td>
                                    <td>{item.quantity}x</td>
                                    <td>{formatCurrency(item.price_at_sale)}</td>
                                    <td>{formatCurrency(item.price_at_sale * item.quantity)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              <FiChevronLeft />
              Vorige
            </button>

            <span className={styles.paginationInfo}>Pagina {currentPage} van {totalPages} •</span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              Volgende
              <FiChevronRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
}