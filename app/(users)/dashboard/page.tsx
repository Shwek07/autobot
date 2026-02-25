import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Layout from "./DashboardLayout";
import StatsCard from "./StatsCard";
import RecentOrders from "./RecentOrders";
import styles from "./Dashboard.module.css";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) return redirect("/login");

  if (session.user?.role === "ADMIN") return redirect("/admin/admin");

  return (
    <Layout>
      <div className={styles.statsGrid}>
        <StatsCard title="Bestellingen" value="12" icon="📦" />
        <StatsCard title="Mijn Auto's" value="2" icon="🚗" />
        <StatsCard title="Favorieten" value="5" icon="⭐" />
      </div>

      <RecentOrders />
    </Layout>
  );
}
