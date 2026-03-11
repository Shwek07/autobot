import type { ReactNode } from "react";
import Navbar from "@/components/Navbar/navbar";
import Providers from "@/app/providers";
import "@/app/globals.css";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="root-body">
        <Navbar />
        <div className="content-layer">{children}</div>
      </div>
    </Providers>
  );
}