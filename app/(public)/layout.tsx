// app/layout.tsx

import type { ReactNode } from "react";
import Navbar from "@/components/Navbar/navbar";


export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
      <html lang="en" style={{ backgroundColor: '#0f0f12', margin: 0, padding: 0 }}>
      <body style={{ 
        backgroundColor: '#0f0f12', 
        margin: 0, 
        padding: 0,
        minHeight: '100vh',
        width: '100%'
      }}>
        {children}
      </body>
    </html>
  );
}
