// app/(public)/products/page.tsx
import { Suspense } from "react";
import styles from "./products.module.css";
import ReserveAfterLogin from "./ReserveAfterLogin";
import ReserveButton from "@/components/reservebutton/ReserveButton";

type SearchParams = {
  brand?: string;
  model?: string;
  year?: string;
};

async function fetchProducts(params: SearchParams) {
  const brand = params.brand ?? "";
  const model = params.model ?? "";
  const year = params.year ?? "";

  if (!brand || !model || !year) return null;

  const qs = new URLSearchParams({ brand, model, year });

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  const url = `${baseUrl}/api/products/by-car?${qs.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  return res.json();
}

function ProductCard({ p }: { p: any }) {
  const inStock = (p.stock_quantity ?? 0) > 0;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {/* Image placeholder (later: echte product image) */}
        <div className={styles.imagePlaceholder} aria-hidden="true" />
        <div className={styles.badges}>
          {p.product_merk ? <span className={styles.badgeBrand}>{p.product_merk}</span> : null}
          <span className={inStock ? styles.badgeStockOk : styles.badgeStockLow}>
            {inStock ? `Op voorraad: ${p.stock_quantity}` : "Niet op voorraad"}
          </span>
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{p.product_name ?? "Onbekend product"}</h3>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Part #</span>
            <span className={styles.metaValue}>{p.part_number ?? "-"}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>SKU</span>
            <span className={styles.metaValue}>{p.sku ?? "-"}</span>
          </div>
        </div>

        {p.description ? (
          <p className={styles.desc}>
            {String(p.description).slice(0, 90)}
            {String(p.description).length > 90 ? "…" : ""}
          </p>
        ) : (
          <p className={styles.descMuted}>Geen beschrijving beschikbaar.</p>
        )}

        <div className={styles.footer}>
          <div className={styles.priceWrap}>
            <span className={styles.priceLabel}>Prijs</span>
            <span className={styles.price}>{p.verkoop_prijs ?? "-"}</span>
          </div>

          <div className={styles.actions}>
          <button className={styles.btnSecondary} type="button">
            Details
          </button>

          <ReserveButton
            productId={p.product_id}
            productName={p.product_name}
            disabled={!inStock}
          />
        </div>
        </div>
      </div>
    </article>
  );
}

async function Results({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  if (!sp.brand || !sp.model || !sp.year) {
    return <p className={styles.helperText}>Kies eerst merk, model en bouwjaar via de homepage.</p>;
  }

  const data = await fetchProducts(sp);

  if (!data) {
    return <p className={styles.helperText}>Kon resultaten niet laden.</p>;
  }

  const { auto, products, message } = data;

  return (
    <div className={styles.resultsWrap}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryTitle}>
          Onderdelen voor: <span className={styles.summaryStrong}>{auto.brand} {auto.model}</span>{" "}
          <span className={styles.summaryYear}>({auto.year})</span>
        </div>
        <div className={styles.summarySubtitle}>
          {message ? message : `${products.length} onderdelen gevonden`}
        </div>
      </div>

      {products.length === 0 ? (
        <p className={styles.helperText}>Geen onderdelen gevonden voor deze auto.</p>
      ) : (
        <div className={styles.grid}>
          {products.map((p: any) => (
            <ProductCard key={p.product_id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <main className={styles.page}>
      <Suspense fallback={null}>
        <ReserveAfterLogin />
      </Suspense>

      <Suspense fallback={<p className={styles.helperText}>Bezig met laden...</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}