// components/pos/ReceiptModal.tsx
'use client';

import { useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  FiX, 
  FiPrinter, 
  FiDownload, 
  FiCheckCircle,
  FiInfo,
  FiClock,
  FiHash,
  FiCreditCard,
  FiDollarSign,
  FiMinus,
  FiStar,
  FiMap
} from 'react-icons/fi';
import styles from './receipt.module.css';

interface CartItem {
  product_id: number;
  product_name: string;
  product_merk: string;
  verkoop_prijs: number;
  quantity: number;
  part_number?: string;
}

interface Transaction {
  order_id: number;
  total: number;
  subtotal: number;
  btw: number;
  payment_method: string;
  created_at: string;
}

interface Props {
  transaction: Transaction;
  cart: CartItem[];
  onClose: () => void;
}

export default function ReceiptModal({ transaction, cart, onClose }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Bon-${transaction.order_id}`,
    onAfterPrint: () => console.log('Print completed'),
  });

  const handleDownloadPDF = async () => {
    // Hier zou je een PDF generatie bibliotheek kunnen gebruiken
    // Voor nu simuleren we het met een alert
    alert('PDF wordt gegenereerd en gedownload...');
    
    // In een echte implementatie zou je hier iets doen als:
    // const pdf = await generatePDF(receiptRef.current);
    // download(pdf, `bon-${transaction.order_id}.pdf`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPaymentMethodDutch = (method: string) => {
    switch (method) {
      case 'contant': 
        return { 
          label: 'Contant', 
          icon: <FiDollarSign />,
          color: '#48bb78'
        };
      case 'pin': 
        return { 
          label: 'Pin', 
          icon: <FiCreditCard />,
          color: '#667eea'
        };
      case 'ideal': 
        return { 
          label: 'iDEAL', 
          icon: <FiCreditCard />,
          color: '#9f7aea'
        };
      case 'creditcard': 
        return { 
          label: 'Creditcard', 
          icon: <FiCreditCard />,
          color: '#ed8936'
        };
      default: 
        return { 
          label: method, 
          icon: <FiInfo />,
          color: '#718096'
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const paymentInfo = getPaymentMethodDutch(transaction.payment_method);

  return (
    <div className={styles.modalOverlay}>
      <div ref={modalRef} className={styles.modalContainer}>
        {/* Printable Receipt */}
        <div ref={receiptRef} className={styles.receiptContainer}>
          {/* Header */}
          <div className={styles.receiptHeader}>
             <div className={styles.logo}>
          <span className={styles.logoMain}># CARPARTS</span>
          <span className={styles.logoExpert}>EXPERT</span>
        </div>
            <p className={styles.storeSubtitle}>Auto-Onderdelen Specialist</p>
            <div className={styles.storeInfo}>
              <span>
                <FiMap size={12} />
                Ramdhiansing straat 29
              </span>
              <FiMinus size={12} />
              <span>
                <FiInfo size={12} />
                BTW: 10%
              </span>
            </div>
            <div className={styles.storeInfo}>
              <span>
                <FiStar size={12} />
                Tel: 012-3456789
              </span>
            </div>
          </div>

          {/* Receipt Info */}
          <div className={styles.receiptInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                <FiHash style={{ marginRight: '0.25rem' }} />
                Bonnummer:
              </span>
              <span className={`${styles.infoValue} ${styles.mono}`}>
                #{transaction.order_id.toString().padStart(6, '0')}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                <FiClock style={{ marginRight: '0.25rem' }} />
                Datum:
              </span>
              <span className={styles.infoValue}>
                {formatDateShort(transaction.created_at)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Tijd:</span>
              <span className={styles.infoValue}>
                {formatTime(transaction.created_at)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                {paymentInfo.icon}
                Betaalmethode:
              </span>
              <span 
                className={styles.infoValue}
                style={{ color: paymentInfo.color }}
              >
                {paymentInfo.label}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>Aantal</th>
                <th>Omschrijving</th>
                <th>Bedrag</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={index}>
                  <td>{item.quantity}x</td>
                  <td>
                    <div className={styles.productName}>{item.product_name}</div>
                    <div className={styles.productDetails}>
                      <span className={styles.productMerk}>{item.product_merk}</span>
                      {item.part_number && (
                        <span className={styles.productPartNumber}>
                          Art.nr: {item.part_number}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{formatCurrency(item.verkoop_prijs * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className={styles.totalsSection}>
            <div className={styles.totalRow}>
              <span>Subtotaal:</span>
              <span>{formatCurrency(transaction.subtotal)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>BTW 10%:</span>
              <span>{formatCurrency(transaction.btw)}</span>
            </div>
            <div className={styles.grandTotal}>
              <span>Totaal:</span>
              <span>{formatCurrency(transaction.total)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.receiptFooter}>
            <p className={styles.footerText}>Bedankt voor uw aankoop!</p>
            <p className={styles.footerSmall}>Bewaar dit bonnetje voor garantie</p>
            <p className={styles.footerSmall}>Retourneren mogelijk binnen 7 dagen</p>
            
            <div className={styles.footerDivider}>
              <FiMinus />
              <FiStar />
              <FiMinus />
            </div>
            
            <p className={styles.copyright}>
              © {new Date().getFullYear()} Autoname - Alle rechten voorbehouden
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button
            onClick={handlePrint}
            className={styles.printButton}
          >
            <FiPrinter />
            Bon printen
          </button>
          <button
            onClick={handleDownloadPDF}
            className={styles.downloadButton}
          >
            <FiDownload />
            Download PDF
          </button>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            <FiX />
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}