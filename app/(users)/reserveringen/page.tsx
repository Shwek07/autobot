import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

import ReservationTable from "../dashboard/ReservationTable";
import styles from "./dashboard.module.css";

export default async function ReserveringPage() {
  const session = await getServerSession(authOptions);

  if (!session) return redirect("/login");

  if (session.user?.role === "ADMIN") return redirect("/admin/admin");

  return (
      <>
   
      <ReservationTable />
   
    </>
  );

}
