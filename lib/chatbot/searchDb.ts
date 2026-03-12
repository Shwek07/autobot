import { query } from "@/lib/db";
import type { SearchResultItem, SearchState } from "./types";

interface SearchDbResult {
  items: SearchResultItem[];
  totalFound: number;
  sql: string;
  params: Array<string | number>;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

export async function searchProductsForVehicle(
  searchState: SearchState
): Promise<SearchDbResult> {
  const part = normalizeText(searchState.part);
  const brand = normalizeText(searchState.brand);
  const autoBrand = normalizeText(searchState.autoBrand);
  const model = normalizeText(searchState.model);
  const year = Number(searchState.year);

  const sql = `
    SELECT
      p.product_id,
      p.product_name,
      COALESCE(p.product_merk, '') AS product_brand,
      COALESCE(c.category_name, '') AS category_name,
      COALESCE(p.part_number, '') AS part_number,
      COALESCE(p.sku, '') AS sku,
      p.verkoop_prijs AS sale_price,
      p.stock_quantity,
      COALESCE(am.auto_merk, '') AS auto_brand,
      COALESCE(am.auto_model, '') AS auto_model,
      am.bouwjaar AS year,
      pc.compatibility_id
    FROM product_compatibility pc
    INNER JOIN products p
      ON p.product_id = pc.product_id
    INNER JOIN auto_model am
      ON am.auto_id = pc.auto_id
    LEFT JOIN categories c
      ON c.category_id = p.category_id
    WHERE p.is_active = 1
      AND (
        LOWER(p.product_name) LIKE '%' || $1 || '%'
        OR LOWER(COALESCE(c.category_name, '')) LIKE '%' || $1 || '%'
      )
      AND LOWER(COALESCE(p.product_merk, '')) LIKE '%' || $2 || '%'
      AND LOWER(COALESCE(am.auto_merk, '')) LIKE '%' || $3 || '%'
      AND LOWER(COALESCE(am.auto_model, '')) LIKE '%' || $4 || '%'
      AND am.bouwjaar = $5
    ORDER BY
      CASE
        WHEN LOWER(p.product_name) = $1 THEN 0
        WHEN LOWER(p.product_name) LIKE $1 || '%' THEN 1
        ELSE 2
      END,
      p.stock_quantity DESC NULLS LAST,
      p.product_name ASC
    LIMIT 10
  `;

  const params = [part, brand, autoBrand, model, year];

  const result = await query(sql, params);

  const items: SearchResultItem[] = result.rows.map((row: any) => ({
    productId: Number(row.product_id),
    productName: String(row.product_name || ""),
    productBrand: String(row.product_brand || ""),
    categoryName: String(row.category_name || ""),
    partNumber: String(row.part_number || ""),
    sku: String(row.sku || ""),
    salePrice: row.sale_price != null ? Number(row.sale_price) : null,
    stockQuantity: row.stock_quantity != null ? Number(row.stock_quantity) : null,
    autoBrand: String(row.auto_brand || ""),
    autoModel: String(row.auto_model || ""),
    year: row.year != null ? Number(row.year) : null,
    compatibilityId:
      row.compatibility_id != null ? Number(row.compatibility_id) : null,
  }));

  return {
    items,
    totalFound: items.length,
    sql,
    params,
  };
}