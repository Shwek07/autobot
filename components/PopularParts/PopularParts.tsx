import styles from "./populairparts.module.css";
import Image from "next/image";
import Link from "next/link";


export default function Parts(){

    const categories = [
    { slug: "banden", title: "Banden", image: "/images/category/banden.png", href: "" },
    { slug: "interieur", title: "Interieur", image: "/images/category/interieur.png", href: "" },
     { slug: "machine", title: "Machine", image: "/images/category/machine.png", href: "" },
    { slug: "onderstel", title: "Onderstel", image: "/images/category/onderstel.png", href: "" },
  ];



    return (
        <section className={styles.categories}>
            <div className={styles.content}>
             <div className={styles.header}>
               <h1>Populaire onderdelen voor jou auto </h1>
               <p>Zie de meest gezochte onderdelen</p>
             </div>

                <div className={styles.grid}>
                {categories.map((category) =>
                <Link key={category.slug} href={`/category/${category.slug}`} className={styles.card}>
                
                <div className={styles.imageWrapper}>
                    <Image src={category.image} alt={category.title} fill className={styles.image} />
                </div>

                <div className={styles.cardContent}>
                    <h3>{category.title}</h3>
                    <p>Bekijk alle onderdelen in deze categorie</p>
                    <span className={styles.button}>Bekijk</span>
                </div>
                </Link>  
                )}
                </div>
            </div>
        </section>
    );
}