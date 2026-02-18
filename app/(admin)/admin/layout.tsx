// app/admin/layout.tsx


import Sidebar from "@/components/dashboard/Sidebar";
import styles from "./adminlayout.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Sidebar />

      <div className={styles.main}>

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
