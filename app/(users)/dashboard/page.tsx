import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) return redirect("/login");

  if (session.user?.role === "ADMIN") return redirect("/admin/admin");

  return <div>Welkom bij je gebruikersdashboard!</div>;
}
