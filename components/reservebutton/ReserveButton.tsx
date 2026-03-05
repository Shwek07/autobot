"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import styles from "@/app/(public)/products/products.module.css";

type Props = {
  productId: number;
  productName?: string | null;
  disabled?: boolean;
};

export default function ReserveButton({ productId, productName, disabled }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  const brand = sp.get("brand") ?? "";
  const model = sp.get("model") ?? "";
  const year = sp.get("year") ?? "";

  async function createReservation() {
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          quantity: "1",
          product_name: productName ?? undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error ?? "Reserveren mislukt");
        return;
      }

      alert(data?.message ?? "✅ Reservering geplaatst!");
    } finally {
      setLoading(false);
    }
  }

  async function handleClick() {
    if (disabled || loading) return;

    // 1) Not logged in -> go login, but remember what to reserve
    if (status !== "authenticated") {
      const callbackUrl =
        `/products?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}` +
        `&reserve=1&product_id=${encodeURIComponent(String(productId))}` +
        (productName ? `&product_name=${encodeURIComponent(productName)}` : "");

      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    // 2) Logged in -> reserve now
    await createReservation();
  }

  return (
    <button
      className={styles.btnPrimary}
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {disabled ? "Niet beschikbaar" : loading ? "Bezig..." : "Reserveren"}
    </button>
  );
}