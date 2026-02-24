// app/(public)/layout.tsx
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar/navbar";
import Providers from "@/app/providers";
import "@/app/globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="root-body" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <div className="content-layer">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
