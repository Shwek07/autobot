"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./Dashboard.module.css";
import { signOut } from "next-auth/react";


export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/products", label: "Producten", icon: "📦" },
    { href: "/admin/cars", label: "Auto's", icon: "🛒" },
    { href: "/admin/users", label: "Gebruikers", icon: "👥" },
  ];

 async function handleLogout() {
  await fetch("/api/logout", { method: "POST" });
  await signOut({ callbackUrl: "/" });
}


  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
      {/* Logo Section */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logoWrapper}>
          <span className={styles.logoIcon}>⚡</span>
          {!isCollapsed && <h2 className={styles.logoText}>AdminPanel</h2>}
        </div>
        <button 
          className={styles.collapseButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Uitklappen" : "Inklappen"}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!isCollapsed && (
                <>
                  <span className={styles.navLabel}>{item.label}</span>
                  {isActive && <span className={styles.activeIndicator} />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      {!isCollapsed && (
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>👤</div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>Admin User</span>
              <span className={styles.userRole}>Super Admin</span>
            </div>
          </div>
          <button
  onClick={handleLogout}
  className={styles.logoutButton}
>
  🚪 Uitloggen
</button>

          <div className={styles.footerStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>23</span>
              <span className={styles.statLabel}>Nieuwe orders</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>5</span>
              <span className={styles.statLabel}>Berichten</span>
            </div>
          </div>

         
        </div>
      )}

      {/* Collapsed Footer */}
      {isCollapsed && (
        <div className={styles.sidebarFooterCollapsed}>
          <button className={styles.iconButton} title="Instellingen">
            ⚙️
          </button>
          <button className={styles.iconButton} title="Meldingen">
            🔔
          </button>
          <button className={styles.iconButton} title="Profiel">
            👤
          </button>
        </div>
      )}
    </aside>
  );
}