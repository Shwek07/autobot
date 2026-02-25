"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Dashboard.module.css";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { href: "/users/dashboard", label: "Dashboard", icon: "🏎️" },
    { href: "/users/orders", label: "Bestellingen", icon: "📦" },
    { href: "/users/vehicles", label: "Mijn Auto’s", icon: "🚗" },
    { href: "/users/favorites", label: "Favorieten", icon: "⭐" },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        🔧 AutoParts Pro
      </div>

      <nav>
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${
              pathname === item.href ? styles.active : ""
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
