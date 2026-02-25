import { ReactNode } from "react";
import DashboardLayout from "./dashboard/Layout";
import "../globals.css";

export default function UsersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
