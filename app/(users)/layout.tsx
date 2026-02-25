import { ReactNode } from "react";
import DashboardLayout from "./dashboard/DashboardLayout";

export default function UsersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
