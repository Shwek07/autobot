"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Dashboard.module.css";
import { signOut } from "next-auth/react";

export default function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
}: {
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/products", label: "Producten", icon: "📦" },
    { href: "/admin/cars", label: "Auto's", icon: "🚗" },
    { href: "/admin/users", label: "Gebruikers", icon: "👥" },
  ];

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    await signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <aside
        className={`${styles.sidebar} ${
          isMobileOpen ? styles.open : ""
        }`}
      >
        <div className={styles.logo}>AdminPanel</div>

        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`${styles.navLink} ${
                  isActive ? styles.navLinkActive : ""
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
            <button onClick={handleLogout} className={styles.logoutButton}>
          🚪 Uitloggen
        </button>
        </nav>
      </aside>

      {isMobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}