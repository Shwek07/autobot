// app/cars/Page.tsx

'use client';

import { useEffect, useState } from "react";
import Footer from "@/components/footer/footer";
import Cars from "@/components/cars/Cars";



export default function page() {
  return (
    <section>
    <div>
     
      <Cars />
      <Footer />  
    </div>
    </section>
  
  );
}
