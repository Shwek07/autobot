// app/layout.tsx

import type { ReactNode } from "react";
import Navbar from "@/components/Navbar/navbar";
import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="bg-layer" />
          <Navbar />
          <div className="content-layer">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}