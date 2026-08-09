import React from "react";
import { useApp } from "../../context/AppContext";
import { LayoutDashboard, Receipt, Package, Users, Menu, Bot } from "lucide-react";

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, setAiDrawerOpen, setMobileMenuOpen } = useApp();

  const tabs = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "Billing", label: "Billing", icon: Receipt },
    { id: "Inventory", label: "Stock", icon: Package },
    { id: "Customers", label: "Ledger", icon: Users },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              isActive
                ? "text-emerald-600 dark:text-emerald-400 font-bold scale-105"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}

      {/* Menu Drawer Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="flex flex-col items-center py-1 px-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        title="Open Full Menu"
      >
        <Menu className="w-5 h-5 mb-0.5 text-emerald-500" />
        <span className="text-[10px]">Menu</span>
      </button>

      {/* Floating Mobile AI Trigger */}
      <button
        onClick={() => setAiDrawerOpen(true)}
        className="flex flex-col items-center py-1 px-2.5 rounded-xl text-emerald-500 font-bold"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/30">
          <Bot className="w-4 h-4" />
        </div>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">AI</span>
      </button>
    </div>
  );
};
