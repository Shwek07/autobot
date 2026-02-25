// app/admin/layout.tsx


import Sidebar from "@/components/dashboard/Sidebar";
import styles from "./usersGlobal.module.css";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <div className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
