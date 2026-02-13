"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Close menu on route change (when user clicks a link)
  function close() {
    setOpen(false);
  }

  // Close on ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand} onClick={close} aria-label="Go to homepage">
          <div className={styles.logoWrapper}>
            <Image
              className={styles.logoImage}
              src="/images/logo.jpg"
              alt="Logo"
              fill
              sizes="130px"
              priority
            />
          </div>
        </Link>

        {/* Desktop menu */}
        <div className={styles.menu}>
          <Link href="/" onClick={close}>Home</Link>
          <Link href="/autobot" onClick={close}>AutoBot</Link>
          <Link href="/onderdelen" onClick={close}>Onderdelen</Link>
          <Link href="/faq" onClick={close}>FAQ</Link>
          <Link href="/contact" onClick={close}>Contact</Link>
        </div>
        
        {/* Desktop CTA */}
        <Link href="/admin/dashboard" className={styles.button} onClick={close}>
          Call us now: +597 868-5952
        </Link>

        {/* Mobile hamburger */}
        <button
          type="button"
          className={styles.burger}
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`${styles.burgerLine} ${open ? styles.line1Open : ""}`} />
          <span className={`${styles.burgerLine} ${open ? styles.line2Open : ""}`} />
          <span className={`${styles.burgerLine} ${open ? styles.line3Open : ""}`} />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        onClick={close}
      />

      {/* Mobile panel */}
      <div className={`${styles.mobilePanel} ${open ? styles.mobilePanelOpen : ""}`}>
        <div className={styles.mobileLinks}>
           <Link href="/" onClick={close}>Home</Link>
          <Link href="/autobot" onClick={close}>AutoBot</Link>
          <Link href="/onderdelen" onClick={close}>Onderdelen</Link>
          <Link href="/faq" onClick={close}>FAQ</Link>
          <Link href="/contact" onClick={close}>Contact</Link>
        </div>

        <Link href="/book" className={styles.mobileBook} onClick={close}>
         Call us now: +597 868-5952
        </Link>
      </div>
    </nav>
  );
}
