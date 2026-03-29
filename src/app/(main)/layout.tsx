import { Sidebar, MobileHeader } from "@/components/layout/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <MobileHeader />
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
