import styles from "./footer.module.css";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* Column 1 */}
        <div className={styles.col}>
          <img src="/logo.png" alt="Logo" className={styles.logoImage} />
          <p>
            Jouw betrouwbare plek voor auto onderdelen. Kwaliteit, snelheid en
            de beste prijzen op één plek.
          </p>
        </div>

        {/* Column 2 */}
        <div className={styles.col}>
          <h3>Snelle links</h3>
          <Link href="/">Home</Link>
          <Link href="/autobot">AutoBot</Link>
          <Link href="/onderdelen">Onderdelen</Link>
          <Link href="/faq">FAQ</Link>
        </div>

        {/* Column 3 */}
        <div className={styles.col}>
          <h3>Categorieën</h3>
          <Link href="/category/banden">Banden</Link>
          <Link href="/category/interieur">Interieur</Link>
          <Link href="/category/machine">Machine</Link>
          <Link href="/category/onderstel">Onderstel</Link>
        </div>

        {/* Column 4 */}
        <div className={styles.col}>
          <h3>Contact</h3>
          <p>Email: info@autoparts.com</p>
          <p>Tel: +597 868-5952</p>

          <div className={styles.socials}>
            <FaFacebookF />
            <FaInstagram />
            <FaWhatsapp />
          </div>
        </div>

      </div>

      <div className={styles.bottom}>
        © {new Date().getFullYear()} AutoParts. All rights reserved.
      </div>
    </footer>
  );
}
