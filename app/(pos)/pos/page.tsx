// app/(pos)/pos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import ProductSearch from '@/components/pos/ProductSearch';
import ShoppingCart from '@/components/pos/ShoppingCart';
import PaymentModal from '@/components/pos/PaymentModal';
import ReceiptModal from '@/components/pos/ReceiptModal';
import styles from './pos.module.css';
import { 
  FiShoppingBag, 
  FiUser, 
  FiCalendar, 
  FiClock,
  FiLogOut 
} from 'react-icons/fi';
import SalesHistory from '@/components/pos/SalesHistory';

interface CartItem {
  product_id: number;
  product_name: string;
  product_merk: string;
  verkoop_prijs: number;
  quantity: number;
  stock_quantity: number;
  part_number?: string;
}

export default function POSPage() {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'POS') {
      redirect('/login');
    }
  }, [session, status]);

  const handleLogout = async () => {
    if (cart.length > 0) {
      const confirmLogout = window.confirm(
        'Je hebt nog artikelen in je winkelwagen. Weet je zeker dat je wilt uitloggen?'
      );
      if (!confirmLogout) return;
    }
    
    await signOut({ callbackUrl: '/login' });
  };

  const addToCart = (product: any, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.product_id);
      
      if (existing) {
        if (existing.quantity + quantity > product.stock_quantity) {
          alert(`Niet genoeg voorraad! Maximaal ${product.stock_quantity} stuks beschikbaar.`);
          return prev;
        }
        
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      if (quantity > product.stock_quantity) {
        alert(`Niet genoeg voorraad! Maximaal ${product.stock_quantity} stuks beschikbaar.`);
        return prev;
      }
      
      return [...prev, {
        product_id: product.product_id,
        product_name: product.product_name,
        product_merk: product.product_merk,
        verkoop_prijs: parseFloat(product.verkoop_prijs),
        quantity,
        stock_quantity: product.stock_quantity,
        part_number: product.part_number
      }];
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => {
      const item = prev.find(i => i.product_id === productId);
      if (item && newQuantity > item.stock_quantity) {
        alert(`Niet genoeg voorraad! Maximaal ${item.stock_quantity} stuks beschikbaar.`);
        return prev;
      }

      return prev.map(item =>
        item.product_id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    if (cart.length > 0 && confirm('Weet je zeker dat je de winkelwagen wilt legen?')) {
      setCart([]);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.verkoop_prijs * item.quantity), 0);
  };

  const calculateBTW = (subtotal: number) => {
    return subtotal * 0.21;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + calculateBTW(subtotal);
  };

  const handlePaymentComplete = (transaction: any) => {
    setLastTransaction(transaction);
    setShowPayment(false);
    setShowReceipt(true);
    setCart([]);
  };

  if (status === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Kassa systeem wordt geladen...</p>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const btw = calculateBTW(subtotal);
  const total = calculateTotal();

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Moderne header met logout button */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <div className={styles.logo}>
                <span className={styles.logoMain}># CARPARTS</span>
                <span className={styles.logoExpert}>EXPERT</span>
              </div>
              
              <p className={styles.headerSubtitle}>
                <FiUser />
                Ingelogd als: <span className={styles.userBadge}>{session?.user?.name}</span>
              </p>
            </div>
            <button 
                onClick={handleLogout}
                className={styles.logoutButton}
                title="Uitloggen"
              >
                <FiLogOut />
                <span>Uitloggen</span>
              </button>
              
            <div className={styles.headerRight}>
                
              <div className={styles.headerDateTime}>
                <p className={styles.headerDate}>
                  <FiCalendar />
                  {new Date().toLocaleDateString('nl-NL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className={styles.headerTime}>
                  <FiClock />
                  {new Date().toLocaleTimeString('nl-NL', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>  
            </div>  
          </div>
        </div>

        {/* Main content grid */}
        <div className={styles.gridContainer}>
          {/* Linker kolom - Producten */}
          <div className={styles.leftColumn}>
            <ProductSearch 
              onAddToCart={addToCart} 
              cartItems={cart}
            />
          </div>
          
          {/* Rechter kolom - Winkelwagen */}
          <div className={styles.rightColumn}>
            <ShoppingCart
              items={cart}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onClearCart={clearCart}
              subtotal={subtotal}
              btw={btw}
              total={total}
              onCheckout={() => setShowPayment(true)}
            />
          </div>
        </div>

        {/* Modals */}
        {showPayment && (
          <PaymentModal
            cart={cart}
            subtotal={subtotal}
            btw={btw}
            total={total}
            onClose={() => setShowPayment(false)}
            onComplete={handlePaymentComplete}
          />
        )}

        {showReceipt && lastTransaction && (
          <ReceiptModal
            transaction={lastTransaction}
            cart={cart}
            onClose={() => setShowReceipt(false)}
          />
        )}
      </div>
      <SalesHistory />
    </div>
  );
}