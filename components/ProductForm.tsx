"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Category {
  category_id: number;
  category_name: string;
}

interface ProductFormProps {
  product?: any;
  onClose: () => void;
  onSave: () => void;
}

export default function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    product_name: "",
    category_id: "",
    part_number: "",
    description: "",
    sku: "",
    product_merk: "",
    inkoop_prijs: "",
    verkoop_prijs: "",
    stock_quantity: "0",
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
    if (product) {
      setFormData({
        product_name: product.product_name || "",
        category_id: product.category_id?.toString() || "",
        part_number: product.part_number || "",
        description: product.description || "",
        sku: product.sku || "",
        product_merk: product.product_merk || "",
        inkoop_prijs: product.inkoop_prijs?.toString() || "",
        verkoop_prijs: product.verkoop_prijs?.toString() || "",
        stock_quantity: product.stock_quantity?.toString() || "0",
        is_active: product.is_active ?? true,
      });
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = product
        ? `/api/products/${product.product_id}`
        : "/api/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSave();
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.product_name}
                onChange={(e) =>
                  setFormData({ ...formData, product_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Number *
              </label>
              <input
                type="text"
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.part_number}
                onChange={(e) =>
                  setFormData({ ...formData, part_number: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.product_merk}
                onChange={(e) =>
                  setFormData({ ...formData, product_merk: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, stock_quantity: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price (€)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.inkoop_prijs}
                onChange={(e) =>
                  setFormData({ ...formData, inkoop_prijs: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price (€)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.verkoop_prijs}
                onChange={(e) =>
                  setFormData({ ...formData, verkoop_prijs: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Active Product
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {product ? "Update" : "Create"} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}