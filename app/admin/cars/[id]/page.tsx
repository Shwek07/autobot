//app/cars/[id]/page.tsx

import { notFound } from "next/navigation";
import styles from "./carDetail.module.css";
import { getCarImageUrl } from "@/lib/utils/carImages";
import Link from "next/link";
import { neon } from "@neondatabase/serverless";

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

const sql = neon(process.env.DATABASE_URL!);


interface CarDetailResponse {
  car: CarData;
  products: Product[];
}

async function getCar(id: string): Promise<CarDetailResponse | null> {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;

  const car = await sql`
    SELECT *
    FROM auto_model
    WHERE auto_id = ${numericId}
  `;

  if (car.length === 0) return null;

  const products = await sql`
    SELECT
      p.product_id,
      p.product_name,
      p.product_merk,
      p.part_number,
      p.verkoop_prijs,
      p.stock_quantity,
      c.category_name
    FROM product_compatibility pc
    JOIN products p ON p.product_id = pc.product_id
    LEFT JOIN categories c ON c.category_id = p.category_id
    WHERE pc.auto_id = ${numericId}
    ORDER BY p.product_name
  `;

return {
  car: car[0] as CarData,
  products: products as Product[],
};
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; 
}) {
  const { id } = await params;  
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