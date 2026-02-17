import { Sidebar } from "@/components/layout/Sidebar";
import { AIPanel } from "@/components/layout/AIPanel";
import { ToastProvider } from "@/contexts/ToastContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <TenantProvider>
        <ToastProvider>
          <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-2">{children}</main>
            <AIPanel />
          </div>
        </ToastProvider>
      </TenantProvider>
    </AuthProvider>
  );
}
