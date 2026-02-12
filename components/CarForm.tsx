"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface CarFormProps {
  car?: any;
  onClose: () => void;
  onSave: () => void;
}

export default function CarForm({ car, onClose, onSave }: CarFormProps) {
  const [formData, setFormData] = useState({
    auto_merk: "",
    auto_model: "",
    bouwjaar: "",
    engine_variant: "",
    body_type: "",
  });

  useEffect(() => {
    if (car) {
      setFormData({
        auto_merk: car.auto_merk || "",
        auto_model: car.auto_model || "",
        bouwjaar: car.bouwjaar?.toString() || "",
        engine_variant: car.engine_variant || "",
        body_type: car.body_type || "",
      });
    }
  }, [car]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = car ? `/api/cars/${car.auto_id}` : "/api/cars";
      const method = car ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSave();
      }
    } catch (error) {
      console.error("Error saving car:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {car ? "Edit Car" : "Add New Car"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <input
              type="text"
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.auto_merk}
              onChange={(e) =>
                setFormData({ ...formData, auto_merk: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.auto_model}
              onChange={(e) =>
                setFormData({ ...formData, auto_model: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.bouwjaar}
              onChange={(e) =>
                setFormData({ ...formData, bouwjaar: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Engine Variant
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.engine_variant}
              onChange={(e) =>
                setFormData({ ...formData, engine_variant: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body Type
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.body_type}
              onChange={(e) =>
                setFormData({ ...formData, body_type: e.target.value })
              }
            />
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
              {car ? "Update" : "Create"} Car
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}