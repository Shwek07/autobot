//componencts/cars/Cars.tsx

'use client';

import { useEffect, useState } from "react";
import styles from "./autos.module.css";
import { getCarImageUrl } from "@/lib/utils/carImages";
import Link from "next/link";

interface auto_model {
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

export default function Cars() {
  const [cars, setCars] = useState<auto_model[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState({
    cars: true,
    categories: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCars();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load categories");
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const fetchCars = async () => {
    setLoading(prev => ({ ...prev, cars: true }));
    try {
      const url = selectedCategory
        ? `/api/cars?category=${selectedCategory}`
        : "/api/cars";
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch cars");
      const data = await res.json();
      setCars(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load cars");
    } finally {
      setLoading(prev => ({ ...prev, cars: false }));
    }
  };

  if (loading.categories) {
    return <div className={styles.loading}>Loading categories...</div>;
  }

  return (
    <div className={styles.container}>

      {loading.cars ? (
        <div className={styles.loadingGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className={styles.noResults}>
          <p>No cars found {selectedCategory ? "in this category" : ""}.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {cars.map(car => (
            <Link 
              href={`/admin/cars/${car.auto_id}`} 
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