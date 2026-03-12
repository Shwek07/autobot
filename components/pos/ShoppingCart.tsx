// components/pos/ShoppingCart.tsx
'use client';

import { useState } from 'react';
import { FiShoppingCart, FiTrash2, FiCreditCard, FiPackage, FiX } from 'react-icons/fi';
import styles from './shoppingcart.module.css';

interface CartItem {
  product_id: number;
  product_name: string;
  product_merk: string;
  verkoop_prijs: number;
  quantity: number;
  part_number?: string;
}

interface Props {
  items: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onClearCart?: () => void;
  subtotal: number;
  btw: number;
  total: number;
  onCheckout: () => void;
}

export default function ShoppingCart({
  items,
  onUpdateQuantity,
  onRemove,
  onClearCart,
  subtotal,
  btw,
  total,
  onCheckout
}: Props) {
  const [editingQuantity, setEditingQuantity] = useState<number | null>(null);

  const handleQuantityChange = (productId: number, value: string) => {
    const newQuantity = parseInt(value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      onUpdateQuantity(productId, newQuantity);
    }
  };

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <h2 className={styles.cartTitle}>
          <FiShoppingCart />
          Winkelwagen
          {items.length > 0 && (
            <span className={styles.itemCount}>{items.length}</span>
          )}
        </h2>
        
        {items.length > 0 && onClearCart && (
          <button onClick={onClearCart} className={styles.clearCartBtn}>
            <FiTrash2 />
            Leeg winkelwagen
          </button>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className={styles.emptyCart}>
          <FiShoppingCart className={styles.emptyCartIcon} />
          <p className={styles.emptyCartTitle}>Winkelwagen is leeg</p>
          <p className={styles.emptyCartText}>
            Voeg producten toe via de zoekfunctie
          </p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className={styles.cartItems}>
            {items.map((item) => (
              <div key={item.product_id} className={styles.cartItem}>
                <button
                  onClick={() => onRemove(item.product_id)}
                  className={styles.removeBtn}
                  title="Verwijder item"
                >
                  <FiX />
                </button>
                
                <div className={styles.cartItemContent}>
                  <div className={styles.cartItemImage}>
                    <FiPackage />
                  </div>
                  
                  <div className={styles.cartItemDetails}>
                    <h3 className={styles.cartItemTitle}>{item.product_name}</h3>
                    <p className={styles.cartItemMerk}>{item.product_merk}</p>
                    {item.part_number && (
                      <p className={styles.cartItemPartNumber}>
                        Art. nr: {item.part_number}
                      </p>
                    )}
                    
                    <div className={styles.cartItemPrice}>
                      SRD{(item.verkoop_prijs * item.quantity).toFixed(2)}
                      <small>SRD{item.verkoop_prijs.toFixed(2)}/stuk</small>
                    </div>

                    <div className={styles.quantityControls}>
                      <button
                        onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className={styles.quantityBtn}
                      >
                        -
                      </button>
                      
                      {editingQuantity === item.product_id ? (
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product_id, e.target.value)}
                          onBlur={() => setEditingQuantity(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingQuantity(null)}
                          className={styles.quantityInput}
                          autoFocus
                        />
                      ) : (
                        <span 
                          className={styles.quantityValue}
                          onClick={() => setEditingQuantity(item.product_id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {item.quantity}
                        </span>
                      )}
                      
                      <button
                        onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                        className={styles.quantityBtn}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Section */}
          <div className={styles.totalsSection}>
            <div className={styles.totalRow}>
              <span>Subtotaal:</span>
              <span>SRD{subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>BTW 10%:</span>
              <span>SRD{btw.toFixed(2)}</span>
            </div>
            
            <div className={styles.grandTotal}>
              <span>Totaal:</span>
              <span>SRD{total.toFixed(2)}</span>
            </div>

            <button
              onClick={onCheckout}
              disabled={items.length === 0}
              className={styles.checkoutBtn}
            >
              <FiCreditCard />
              Afrekenen
            </button>
          </div>
        </>
      )}
    </div>
  );
}