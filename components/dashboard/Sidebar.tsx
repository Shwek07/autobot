"use client";
import Link from "next/link";
import styles from "./Dashboard.module.css";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.logo}>Admin</h2>

      <nav className={styles.nav}>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/products">Products</Link>
        <Link href="/admin/orders">Orders</Link>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/messages">Messages</Link>
      </nav>
    </aside>
  );
}
