"use client";

import { useEffect, useState, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import styles from "@/components/dashboard/Dashboard.module.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "auto";
  }, [isMobileOpen]);

  return (
    <SessionProvider>
      <div className={styles.layout}>
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className={styles.main}>
          <Topbar onMenuClick={() => setIsMobileOpen(true)} />
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </SessionProvider>
  );
}
