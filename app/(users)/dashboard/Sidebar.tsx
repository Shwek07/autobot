"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";


export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  const menu = [
    { href: "/dashboard", label: "Dashboard", icon: "🏎️" },
      { href: "/", label: "Website", icon: "🌐" },
      { href: "/chatbot", label: "Chatbot", icon: "🤖" },
    { href: "/reserveringen", label: "Reserveringen", icon: "📦" },
    { href: "/vehicles", label: "Mijn Auto's", icon: "🚗" },
    { href: "/favorites", label: "Favorieten", icon: "⭐" },
  ];

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    await signOut({ callbackUrl: "/" });
  }

  return (
    <>
      {isMobile && (
        <div className={styles.mobileHeader}>
          <div className={styles.logo}>🔧 AutoParts Pro</div>
     
          <button 
            className={styles.hamburger}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
        </div>
      
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {!isMobile && (
          <div className={styles.logo}>
            🔧 AutoParts Pro
          </div>
        )}

        <nav>
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${
                pathname === item.href ? styles.active : ""
              }`}
              onClick={() => isMobile && setIsOpen(false)}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            🚪 Uitloggen
          </button>
        </nav>
      </aside>

      {isMobile && isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
