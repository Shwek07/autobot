//app/cars/page.tsx
'use client';

import Cars from "@/components/cars/Cars";
import Footer from "@/components/footer/footer";

export default function CarsPage() {
  return (
    <div className="pageWrapper">
      <main className="main">
        <Cars />
      </main>
    </div>
  );
}