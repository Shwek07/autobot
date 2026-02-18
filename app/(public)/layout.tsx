// app/layout.tsx

import type { ReactNode } from "react";
import Navbar from "@/components/Navbar/navbar";


export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      
      <body>
       
         <div className="bg-layer" />
         <Navbar />
        <div className="content-layer">
          
          {children}</div>
      </body>
    </html>
  );
}
