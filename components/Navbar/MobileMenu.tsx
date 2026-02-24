"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./navbar.module.css";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button onClick={() => setOpen((v) => !v)}>☰</button>

      {open && (
        <div className={styles.mobilePanel}>
          <Link href="/" onClick={close}>Home</Link>
          <Link href="/autobot" onClick={close}>AutoBot</Link>
          <Link href="/onderdelen" onClick={close}>Onderdelen</Link>
          <Link href="/faq" onClick={close}>FAQ</Link>
          <Link href="/contact" onClick={close}>Contact</Link>
          <Link href="/login" onClick={close}>Call us now</Link>
        </div>
      )}
    </>
  );
}
