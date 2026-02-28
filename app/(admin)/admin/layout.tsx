"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import styles from "@/components/dashboard/Dashboard.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Toggle body scroll when sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMobileOpen]);

  return (
    <div className={styles.layout}>
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className={styles.main}>
        <Topbar onMenuClick={() => setIsMobileOpen(true)} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}