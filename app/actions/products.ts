// app/actions/products.ts
'use server';

import { query } from '@/lib/db';

export async function searchProducts(searchTerm: string) {
  try {
    const result = await query(
      `SELECT 
        product_id, 
        product_name, 
        product_merk,
        part_number,
        sku,
        verkoop_prijs,
        stock_quantity
       FROM products 
       WHERE 
        product_name ILIKE $1 OR 
        product_merk ILIKE $1 OR 
        part_number ILIKE $1 OR
        sku ILIKE $1
       AND is_active = 1
       AND stock_quantity > 0
       ORDER BY product_name
       LIMIT 30`,
      [`%${searchTerm}%`]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

export async function getProductByBarcode(barcode: string) {
  try {
    const result = await query(
      `SELECT 
        product_id, 
        product_name, 
        product_merk,
        part_number,
        sku,
        verkoop_prijs,
        stock_quantity
       FROM products 
       WHERE sku = $1 OR part_number = $1
       AND is_active = 1`,
      [barcode]
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    return null;
  }
}