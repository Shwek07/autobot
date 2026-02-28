"use client";

import styles from "./brands.module.css";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Brands() {
  const brands = [
    { name: "Toyota", logo: "/images/cars/logo/toyota.svg" },
    { name: "Nissan", logo: "/images/cars/logo/nissan.svg" },
    { name: "Ford", logo: "/images/cars/logo/ford.svg" },
    { name: "Mazda", logo: "/images/cars/logo/mazda.svg" },
    { name: "Lexus", logo: "/images/cars/logo/lexus.svg" },
    { name: "Tesla", logo: "/images/cars/logo/tesla.svg" },
    { name: "Audi", logo: "/images/cars/logo/audi.svg" },
    { name: "Mitsubishi", logo: "/images/cars/logo/mitsubusi.svg" },
    { name: "Subaru", logo: "/images/cars/logo/subaru.svg" },
    { name: "Kia", logo: "/images/cars/logo/kia.svg" },
    { name: "BMW", logo: "/images/cars/logo/bwm.svg" },
    { name: "Mercedes-Benz", logo: "/images/cars/logo/mercedes-Benz.svg" },
    { name: "Porsche", logo: "/images/cars/logo/porsche.svg" },
    { name: "Lamborghini", logo: "/images/cars/logo/lamborghini.svg" },
    { name: "McLaren", logo: "/images/cars/logo/mclaren.svg" },
  ];

  return (
   <section className={styles.brands}>
  <div className={styles.slider}>
    <div className={styles.track}>
      {[...brands, ...brands].map((brand, index) => (
        <div key={index} className={styles.brandItem}>
          <Image
            src={brand.logo}
            alt={brand.name}
            width={90}
            height={40}
            className={styles.logo}
          />
        </div>
      ))}
    </div>
  </div>
</section>

  );
}