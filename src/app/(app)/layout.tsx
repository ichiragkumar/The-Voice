import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <div className="p-6">{children}</div>
      </main>
    </>
  );
}
