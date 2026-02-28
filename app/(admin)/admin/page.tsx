// app/(admin)/admin/page.tsx
import Dashboard from "@/components/dashboard/Dashboard";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) return redirect("/login");

  return <Dashboard />;
}
