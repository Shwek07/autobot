'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./hero.module.css";

interface AutoModel {
  auto_merk: string;
  auto_model: string;
  bouwjaar: number;
}

export default function Hero() {
  const router = useRouter();
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  
  const [loading, setLoading] = useState({
    brands: true,
    models: false,
    years: false
  });

  // Fetch all unique brands on component mount
  useEffect(() => {
  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/hero/brands");
      const data = await res.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        setBrands(data);
      } else {
        console.error("Brands API returned invalid data:", data);
        setBrands([]);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    } finally {
      setLoading(prev => ({ ...prev, brands: false }));
    }
  };

  fetchBrands();
}, []);


  // Fetch models when brand changes
  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      return;
    }

    const fetchModels = async () => {
      setLoading(prev => ({ ...prev, models: true }));
      try {
        const res = await fetch(`/api/hero/models?brand=${encodeURIComponent(selectedBrand)}`);
        const data = await res.json();
        setModels(data);
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        setLoading(prev => ({ ...prev, models: false }));
      }
    };

    fetchModels();
    // Reset model and year when brand changes
    setSelectedModel("");
    setSelectedYear("");
  }, [selectedBrand]);

  // Fetch years when model changes
  useEffect(() => {
    if (!selectedBrand || !selectedModel) {
      setYears([]);
      return;
    }

    const fetchYears = async () => {
      setLoading(prev => ({ ...prev, years: true }));
      try {
        const res = await fetch(
          `/api/hero/years?brand=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(selectedModel)}`
        );
        const data = await res.json();
        setYears(data);
      } catch (error) {
        console.error("Error fetching years:", error);
      } finally {
        setLoading(prev => ({ ...prev, years: false }));
      }
    };

    fetchYears();
    setSelectedYear("");
  }, [selectedBrand, selectedModel]);

  const handleSearch = () => {
    if (!selectedBrand || !selectedModel || !selectedYear) {
      alert("Please select brand, model and year");
      return;
    }
    
    // Redirect to products page with filters
    router.push(`/products?brand=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(selectedModel)}&year=${selectedYear}`);
  };

  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.logo}>
          <span className={styles.logoMain}># CARPARTS</span>
          <span className={styles.logoExpert}>EXPERT</span>
        </div>
        
        <h1>Vind onderdelen voor jouw auto in seconden</h1>
        <p>Selecteer je auto om de juiste onderdelen te vinden</p>

        <div className={styles.searchBox}>
          <select 
            className={styles.select}
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            disabled={loading.brands}
          >
            <option value="">
              {loading.brands ? "Merken laden..." : "Kies een merk"}
            </option>
          {Array.isArray(brands) &&
  brands.map((brand) => (
    <option key={brand} value={brand}>
      {brand}
    </option>
  ))}

          </select>

          <select 
            className={styles.select}
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand || loading.models}
          >
            <option value="">
              {!selectedBrand 
                ? "Selecteer eerst een merk" 
                : loading.models 
                  ? "Modellen laden..." 
                  : "Kies een model"}
            </option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>

          <select 
            className={styles.select}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={!selectedModel || loading.years}
          >
            <option value="">
              {!selectedModel 
                ? "Selecteer eerst een model" 
                : loading.years 
                  ? "Jaren laden..." 
                  : "Kies bouwjaar"}
            </option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <button 
            className={styles.searchButton}
            onClick={handleSearch}
            disabled={!selectedBrand || !selectedModel || !selectedYear}
          >
            Zoek onderdelen
          </button>
        </div>
      </div>
    </section>
  );
}