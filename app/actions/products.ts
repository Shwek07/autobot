// app/actions/products.ts
'use server';
import { query } from '@/lib/db';

export async function searchProducts(searchTerm: string) {
  try {
    const trimmed = searchTerm.trim();

    if (!trimmed) return [];

    const words = trimmed
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);

    if (words.length === 0) return [];

    const params: string[] = [];
    const wordConditions: string[] = [];

    words.forEach((word, index) => {
      const paramIndex = index + 1;
      params.push(`%${word}%`);

      wordConditions.push(`
        (
          product_name ILIKE $${paramIndex}
          OR product_merk ILIKE $${paramIndex}
          OR part_number ILIKE $${paramIndex}
          OR sku ILIKE $${paramIndex}
          OR description ILIKE $${paramIndex}
        )
      `);
    });

    const sql = `
      SELECT 
        product_id, 
        product_name, 
        product_merk,
        part_number,
        description,
        sku,
        verkoop_prijs,
        stock_quantity
      FROM products
      WHERE
        ${wordConditions.join(' AND ')}
        AND is_active = 1
        AND stock_quantity > 0
      ORDER BY product_name
      LIMIT 30
    `;

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

export async function getProductByBarcode(barcode: string) {
  try {
    const trimmed = barcode.trim();

    if (!trimmed) return null;

    const result = await query(
      `SELECT 
        product_id, 
        product_name, 
        product_merk,
        part_number,
        description,
        sku,
        verkoop_prijs,
        stock_quantity
       FROM products 
       WHERE 
        (sku = $1 OR part_number = $1)
        AND is_active = 1
       LIMIT 1`,
      [trimmed]
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    return null;
  }
}