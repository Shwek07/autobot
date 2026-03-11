import styles from "./footer.module.css";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* Column 1 */}
        <div className={styles.col}>
          <img src="./logo.png" alt="Logo" className={styles.logoImage1} />
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
            <a
              href="https://www.facebook.com/597SharpEdgeVisuals"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>

            <a
              href="https://www.instagram.com/shwek07_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>

            <a
              href="https://wa.me/5978685952"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>

      </div>

      <div className={styles.bottom}>
        © {new Date().getFullYear()} AutoParts. All rights reserved.
      </div>
    </footer>
  );
}
