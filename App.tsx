import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider, useApp } from "./context/AppContext";
import { LoginView } from "./components/auth/LoginView";
import { UserProfileBadge } from "./components/auth/UserProfileBadge";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { MobileNav } from "./components/layout/MobileNav";
import { GlobalSearchModal } from "./components/search/GlobalSearchModal";
import { AIAssistantDrawer } from "./components/ai/AIAssistantDrawer";

import { DashboardView } from "./components/dashboard/DashboardView";
import { BillingView } from "./components/billing/BillingView";
import { InventoryView } from "./components/inventory/InventoryView";
import { CustomerView } from "./components/customers/CustomerView";
import { ReportCenterView } from "./components/reports/ReportCenterView";
import { AnalyticsView } from "./components/analytics/AnalyticsView";
import { SettingsView } from "./components/settings/SettingsView";
import { Pill } from "lucide-react";

const MainContent: React.FC = () => {
  const { activeTab, isDataLoading } = useApp();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 animate-bounce">
          <Pill className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-300">Loading your private pharmaceutical workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors max-w-full overflow-x-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden transition-[margin-left] duration-300 pb-16 md:pb-0 ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
        <TopBar
          onOpenMobileMenu={() => setCollapsed(!collapsed)}
        />

        <main className="flex-1 min-w-0 max-w-full overflow-x-hidden">
          {activeTab === "Dashboard" && <DashboardView />}
          {activeTab === "Billing" && <BillingView />}
          {activeTab === "Inventory" && <InventoryView />}
          {activeTab === "Customers" && <CustomerView />}
          {activeTab === "Reports" && <ReportCenterView />}
          {activeTab === "Analytics" && <AnalyticsView />}
          {activeTab === "AI Assistant" && <DashboardView />}
          {activeTab === "Settings" && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Modals & AI Drawer */}
      <GlobalSearchModal />
      <AIAssistantDrawer />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
          <Pill className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Restoring authentication session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
