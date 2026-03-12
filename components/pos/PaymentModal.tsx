// components/pos/PaymentModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createOrder } from '@/app/actions/orders';
import { 
  FiX, 
  FiCreditCard, 
  FiDollarSign, 
  FiSmartphone, 
  FiShoppingBag,
  FiAlertCircle,
  FiCheckCircle 
} from 'react-icons/fi';
import styles from './paymentmodel.module.css';

interface CartItem {
  product_id: number;
  product_name: string;
  product_merk: string;
  verkoop_prijs: number;
  quantity: number;
}

interface Props {
  cart: CartItem[];
  subtotal: number;
  btw: number;
  total: number;
  onClose: () => void;
  onComplete: (transaction: any) => void;
}

type PaymentMethod = 'contant' | 'pin' | 'ideal' | 'creditcard';

export default function PaymentModal({ 
  cart, 
  subtotal, 
  btw, 
  total, 
  onClose, 
  onComplete 
}: Props) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('contant');
  const [cashReceived, setCashReceived] = useState<number>(total);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paymentMethod === 'contant' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [paymentMethod]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const change = cashReceived - total;

  const handlePayment = async () => {
    if (cart.length === 0) {
      setError('Winkelwagen is leeg');
      return;
    }

    if (paymentMethod === 'contant' && cashReceived < total) {
      setError('Ontvangen bedrag is lager dan totaalbedrag');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const transaction = await createOrder({
        items: cart,
        subtotal,
        btw,
        total,
        payment_method: paymentMethod
      });

      setSuccess(true);
      
      setTimeout(() => {
        onComplete(transaction);
      }, 500);
      
    } catch (err: any) {
      setError(err.message || 'Betaling mislukt. Probeer opnieuw.');
      console.error('Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'contant':
        return <FiDollarSign className={styles.paymentIcon} />;
      case 'pin':
        return <FiCreditCard className={styles.paymentIcon} />;
      case 'ideal':
        return <FiSmartphone className={styles.paymentIcon} />;
      case 'creditcard':
        return <FiCreditCard className={styles.paymentIcon} />;
    }
  };

  const getPaymentLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'contant': return 'Contant';
      case 'pin': return 'Pin';
      case 'ideal': return 'iDEAL';
      case 'creditcard': return 'Creditcard';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className={styles.modalOverlay}>
      <div ref={modalRef} className={styles.modalContainer}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Afrekenen</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            disabled={processing}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>
              <FiShoppingBag />
              Order overzicht
            </h3>
            
            <div className={styles.orderItems}>
              {cart.map((item, index) => (
                <div key={index} className={styles.orderItem}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.product_name}</span>
                    <span className={styles.itemMerk}>{item.product_merk}</span>
                    <span className={styles.itemQuantity}>Aantal: {item.quantity}</span>
                  </div>
                  <span className={styles.itemPrice}>
                    {formatCurrency(item.verkoop_prijs * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.totalSection}>
              <div className={styles.totalRow}>
                <span>Subtotaal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>BTW 10%:</span>
                <span>{formatCurrency(btw)}</span>
              </div>
              <div className={styles.grandTotal}>
                <span>Totaal:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className={styles.paymentSection}>
            <label className={styles.sectionLabel}>
              Betaalmethode
            </label>
            <div className={styles.paymentGrid}>
              {(['contant', 'pin'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`${styles.paymentButton} ${
                    paymentMethod === method ? styles.activePayment : ''
                  }`}
                  disabled={processing}
                >
                  {getPaymentIcon(method)}
                  <span>{getPaymentLabel(method)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'contant' && (
            <div className={styles.cashSection}>
              <label className={styles.inputLabel}>
                Ontvangen bedrag
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputPrefix}>€</span>
                <input
                  ref={inputRef}
                  type="number"
                  step="0.01"
                  min={total}
                  value={cashReceived}
                  onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                  className={styles.cashInput}
                  placeholder="0.00"
                  disabled={processing}
                />
              </div>

              {change >= 0 ? (
                <div className={`${styles.changeBox} ${styles.positiveChange}`}>
                  <span>Wisselgeld:</span>
                  <span className={styles.changeAmount}>
                    {formatCurrency(change)}
                  </span>
                </div>
              ) : (
                <div className={`${styles.changeBox} ${styles.negativeChange}`}>
                  <span>Nog te ontvangen:</span>
                  <span className={styles.changeAmount}>
                    {formatCurrency(Math.abs(change))}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={styles.errorBox}>
              <FiAlertCircle className={styles.errorIcon} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className={`${styles.errorBox} ${styles.positiveChange}`}>
              <FiCheckCircle className={styles.errorIcon} />
              <span>Betaling succesvol verwerkt!</span>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actionButtons}>
            <button
              onClick={onClose}
              className={styles.cancelButton}
              disabled={processing}
            >
              Annuleren
            </button>
            <button
              onClick={handlePayment}
              disabled={
                processing || 
                success || 
                (paymentMethod === 'contant' && cashReceived < total)
              }
              className={`${styles.payButton} ${processing ? styles.processing : ''}`}
            >
              {processing ? (
                <>
                  <div className={styles.spinner}></div>
                  Verwerken...
                </>
              ) : success ? (
                <>
                  <FiCheckCircle />
                  Betaald!
                </>
              ) : (
                <>
                  <FiCreditCard />
                  Betaal {formatCurrency(total)}
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '1.5rem',
            fontSize: '0.75rem',
            color: '#999',
            borderTop: '1px solid #f0f0f0',
            paddingTop: '1rem'
          }}>
            <FiCheckCircle style={{ display: 'inline', marginRight: '0.25rem' }} />
            Veilige betaling - SSL beveiligd
          </div>
        </div>
      </div>
    </div>
  );
}