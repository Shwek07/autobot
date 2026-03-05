// app/(public)/products/ReserveAfterLogin.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ReserveAfterLogin() {
  const { status } = useSession();
  const sp = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Wacht tot NextAuth echt "authenticated" is
    if (status !== "authenticated") return;

    const reserve = sp.get("reserve");
    const productId = sp.get("product_id");
    const productName = sp.get("product_name") ?? undefined;

    if (reserve !== "1" || !productId) return;

    // ✅ voorkom dubbel runnen (React strict mode / rerenders)
    const onceKey = `auto_reserve_${productId}`;
    if (sessionStorage.getItem(onceKey) === "1") return;
    sessionStorage.setItem(onceKey, "1");

    (async () => {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: Number(productId),
          quantity: "1",
          product_name: productName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error ?? "Reserveren mislukt");
      } else {
        alert(data?.message ?? "✅ Reservering geplaatst!");
      }

      // ✅ URL opschonen (reserve params weg), maar auto filters behouden
      const brand = sp.get("brand") ?? "";
      const model = sp.get("model") ?? "";
      const year = sp.get("year") ?? "";

      router.replace(
        `/products?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}`
      );
    })();
  }, [status, sp, router]);

  return null;
}