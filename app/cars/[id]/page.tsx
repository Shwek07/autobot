import { notFound } from "next/navigation";
import styles from "./carDetail.module.css";
import { getCarImageUrl } from "@/lib/utils/carImages";
import { Link } from "lucide-react";

interface Product {
  product_id: number;
  product_name: string;
  product_merk: string;
  part_number: string;
  verkoop_prijs: number;
  stock_quantity: number;
  category_name: string;
}

interface CarData {
  auto_id: number;
  auto_merk: string;
  auto_model: string;
  bouwjaar: number;
  body_type: string;
}

async function getCar(id: string) {
  // Gebruik een fallback URL voor ontwikkeling
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(
    `${baseUrl}/api/cars/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;  // 👈 BELANGRIJK: params is een Promise
}) {
  const { id } = await params;  // 👈 Unwrap de Promise
  const data = await getCar(id);

  if (!data) return notFound();

  const car: CarData = data.car;
  const products: Product[] = data.products;

  return (
    <div className={styles.container}>
      {/* Car Header */}
      <div className={styles.hero}>
        <img
          src={getCarImageUrl(car.auto_merk, car.auto_model, car.bouwjaar)}
          alt={`${car.auto_merk} ${car.auto_model}`}
          className={styles.heroImage}
        />

        <div className={styles.heroInfo}>
          <h1>
            {car.auto_merk} {car.auto_model}
          </h1>
          <p>
            {car.bouwjaar} • {car.body_type}
          </p>
          <span className={styles.partCount}>
            {products.length} compatible parts
          </span>
        </div>
      </div>

      {/* Products Section */}
      <h2 className={styles.sectionTitle}>Available Parts</h2>
        <Link href="/cars" className={styles.backLink}>Back to Cars</Link>
      {products.length === 0 ? (
        <p className={styles.noParts}>No compatible parts found.</p>
      ) : (
        <div className={styles.productGrid}>
          {products.map(product => (
            <div key={product.product_id} className={styles.productCard}>
              <h3>{product.product_name}</h3>
              <p className={styles.brand}>{product.product_merk}</p>
              <p className={styles.partNumber}>
                {product.part_number}
              </p>

              <div className={styles.productFooter}>
                <span className={styles.price}>
                  €{Number(product.verkoop_prijs).toFixed(2)}
                </span>

                <span
                  className={
                    product.stock_quantity > 0
                      ? styles.inStock
                      : styles.outOfStock
                  }
                >
                  {product.stock_quantity > 0
                    ? "In Stock"
                    : "Out of Stock"}
                </span>
              </div>

              <span className={styles.category}>
                {product.category_name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}