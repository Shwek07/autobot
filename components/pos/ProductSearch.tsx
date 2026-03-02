// components/pos/ProductSearch.tsx
'use client';

import { useState, useEffect } from 'react';
import { searchProducts } from '@/app/actions/products';
import styles from './productsearch.module.css';
import { FiSearch, FiCode, FiPackage, FiShoppingCart } from 'react-icons/fi';

interface Product {
  product_id: number;
  product_name: string;
  product_merk: string;
  part_number: string;
  verkoop_prijs: number;
  stock_quantity: number;
  sku: string;
}

interface Props {
  onAddToCart: (product: Product, quantity: number) => void;
  cartItems: any[];
}

export default function ProductSearch({ onAddToCart, cartItems }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'barcode'>('name');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchTerm.length > 1 && searchType === 'name') {
        setLoading(true);
        const results = await searchProducts(searchTerm);
        setProducts(results);
        setLoading(false);
      } else if (searchType === 'barcode' && searchTerm.length > 3) {
        setLoading(true);
        const results = await searchProducts(searchTerm);
        setProducts(results);
        setLoading(false);
        
        // Auto-add als exacte barcode match
        if (results.length === 1) {
          handleAddToCart(results[0], 1);
          setSearchTerm('');
        }
      } else {
        setProducts([]);
      }
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchTerm, searchType]);

  const handleAddToCart = (product: Product, quantity: number) => {
    const cartItem = cartItems.find(item => item.product_id === product.product_id);
    const currentInCart = cartItem?.quantity || 0;
    
    if (currentInCart + quantity <= product.stock_quantity) {
      onAddToCart(product, quantity);
      setQuantities(prev => ({ ...prev, [product.product_id]: 1 }));
    } else {
      alert(`Niet genoeg voorraad! Je hebt al ${currentInCart} in winkelwagen. Maximaal ${product.stock_quantity} beschikbaar.`);
    }
  };

  return (
    <div>
      <h2 className={styles.sectionTitle}>
        <FiPackage />
        Auto-Onderdelen Zoeken
      </h2>
      
      <div className={styles.searchContainer}>
        <div className={styles.searchTabs}>
          <button
            className={`${styles.searchTab} ${searchType === 'name' ? styles.activeTab : ''}`}
            onClick={() => setSearchType('name')}
          >
            <FiSearch />
            Zoeken op naam/merk
          </button>
          <button
            className={`${styles.searchTab} ${searchType === 'barcode' ? styles.activeTab : ''}`}
            onClick={() => setSearchType('barcode')}
          >
            <FiCode />
            Barcode scanner
          </button>
        </div>

        <div className={styles.searchInputWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder={searchType === 'name' 
              ? "Zoek op productnaam, merk of onderdeelnummer..." 
              : "Scan barcode of typ onderdeelnummer..."}
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        
        {searchType === 'barcode' && (
          <p className={styles.barcodeHint}>
            <FiCode />
            Druk op Enter na het scannen van de barcode
          </p>
        )}
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Producten zoeken...</p>
        </div>
      )}

      <div className={styles.productsGrid}>
        {products.map((product) => {
          const inCart = cartItems.find(item => item.product_id === product.product_id);
          const maxAvailable = product.stock_quantity - (inCart?.quantity || 0);
          
          return (
            <div key={product.product_id} className={styles.productCard}>
              <div className={styles.productImage}>
                <FiPackage />
                <span className={`${styles.stockBadge} ${
                  maxAvailable > 5 ? styles.stockHigh : styles.stockLow
                }`}>
                  {maxAvailable} op voorraad
                </span>
              </div>
              
              <div className={styles.productInfo}>
                <h3 className={styles.productTitle}>{product.product_name}</h3>
                <p className={styles.productMerk}>{product.product_merk}</p>
                <p className={styles.productPartNumber}>Art. nr: {product.part_number}</p>
                
                <div className={styles.productPrice}>
                  SRD{Number(product.verkoop_prijs).toFixed(2)}
                  <span> excl. BTW</span>
                </div>

                {inCart && (
                  <p className={styles.inCart}>
                    <FiShoppingCart />
                    {inCart.quantity} in winkelwagen
                  </p>
                )}
                
                <div className={styles.addToCartContainer}>
                  <input
                    type="number"
                    min="1"
                    max={maxAvailable}
                    value={quantities[product.product_id] || 1}
                    onChange={(e) => setQuantities(prev => ({
                      ...prev,
                      [product.product_id]: parseInt(e.target.value) || 1
                    }))}
                    className={styles.quantityInput}
                    disabled={maxAvailable === 0}
                  />
                  <button
                    onClick={() => handleAddToCart(product, quantities[product.product_id] || 1)}
                    disabled={maxAvailable === 0}
                    className={styles.addButton}
                  >
                    <FiShoppingCart />
                    Toevoegen
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {products.length === 0 && searchTerm.length > 1 && !loading && (
          <div className={styles.noResults}>
            <FiPackage size={48} />
            <p>Geen producten gevonden voor "{searchTerm}"</p>
            <p className={styles.noResultsSmall}>Probeer een andere zoekterm of scan de barcode</p>
          </div>
        )}
      </div>
    </div>
  );
}