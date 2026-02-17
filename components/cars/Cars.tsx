'use client';

import { useEffect, useState } from "react";
import styles from "./autos.module.css";
import { getCarImageUrl } from "@/lib/utils/carImages";
import Link from "next/link";

interface Car {
  auto_id: number;
  auto_merk: string;
  auto_model: string;
  bouwjaar: number;
  body_type: string;
}

interface Category {
  category_id: number;
  category_name: string;
}

export default function Autos() {
  const [cars, setCars] = useState<Car[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState({
    cars: false,
    categories: false
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch cars when selectedCategory changes
  useEffect(() => {
    fetchCars();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    setLoading(prev => ({ ...prev, categories: true }));
    setError(null);
    
    try {
      console.log("Fetching categories...");
      const res = await fetch("/api/categories");
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || `HTTP error ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Categories received:", data);
      
      // Ensure data is an array
      setCategories(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error instanceof Error ? error.message : "Failed to load categories");
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const fetchCars = async () => {
    setLoading(prev => ({ ...prev, cars: true }));
    setError(null);
    
    try {
      const url = selectedCategory
        ? `/api/cars?category=${selectedCategory}`
        : "/api/cars";
      
      console.log("Fetching cars from:", url);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || `HTTP error ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Cars received:", data);
      
      setCars(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error("Error fetching cars:", error);
      setError(error instanceof Error ? error.message : "Failed to load cars");
    } finally {
      setLoading(prev => ({ ...prev, cars: false }));
    }
  };

  if (loading.categories && categories.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading categories...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Available Cars</h1>
    <Link href="/cars" className={styles.backLink}>← Back to Cars</Link>
      {error && (
        <div className={styles.error}>
          <span>Error: {error}</span>
          <button onClick={() => {
            fetchCategories();
            fetchCars();
          }}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.filterBar}>
        <button 
          onClick={() => setSelectedCategory(null)}
          className={selectedCategory === null ? styles.active : ""}
        >
          All Cars
        </button>

        {categories.map(cat => (
          <button
            key={cat.category_id}
            onClick={() => setSelectedCategory(cat.category_id)}
            className={selectedCategory === cat.category_id ? styles.active : ""}
          >
            {cat.category_name}
          </button>
        ))}
      </div>

      {loading.cars ? (
        <div className={styles.loading}>Loading cars...</div>
      ) : cars.length === 0 ? (
        <div className={styles.noResults}>
          <p>No cars found {selectedCategory ? "for this category" : ""}.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {cars.map(car => (
            <Link 
              href={`/cars/${car.auto_id}`} 
              key={car.auto_id}
              className={styles.cardLink}
            >
              <div className={styles.card}>
                <img
                  src={getCarImageUrl(car.auto_merk, car.auto_model, car.bouwjaar)}
                  alt={`${car.auto_merk} ${car.auto_model}`}
                  className={styles.image}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-car.jpg';
                  }}
                />
                <div className={styles.cardContent}>
                  <h3>{car.auto_merk} {car.auto_model}</h3>
                  <p>{car.bouwjaar} • {car.body_type}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}