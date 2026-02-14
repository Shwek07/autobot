import Sidebar from "@/components/dashboard/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="layout">
      {/* <Sidebar /> */}

      <main className="main">
        <div className="content">
          {children}   
        </div>
      </main>
    </div>
  );
}
