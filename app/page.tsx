import Image from "next/image";
import styles from "./page.module.css";
import Hero from "@/components/hero/hero"
import Brands from "@/components/brands/brands"
import AutoBot from "@/components/autobot/autobot";
import FAQ from "@/components/FAQ/FAQ"
import Parts from "@/components/PopularParts/PopularParts";

export default function Home() {
  return (
   <div>
    <Hero />
    <Brands />
    <AutoBot />
    <Brands />
    <Parts />
    <FAQ />
   </div>
    
  );
}
