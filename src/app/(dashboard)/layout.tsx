import { Sidebar } from "@/components/layout/Sidebar";
import { AIPanel } from "@/components/layout/AIPanel";
import { ToastProvider } from "@/contexts/ToastContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-2">{children}</main>
        <AIPanel />
      </div>
    </ToastProvider>
  );
}
