import React from "react";
import { createPortal } from "react-dom";
import { useApp } from "../../context/AppContext";
import {
  LayoutDashboard,
  Receipt,
  Package,
  Users,
  BookOpen,
  BarChart3,
  FileSpreadsheet,
  Bot,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Pill,
  AlertTriangle,
  Clock,
  Sparkles,
  X,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, onLogout }) => {
  const { activeTab, setActiveTab, products, customers, currentUser, mobileMenuOpen, setMobileMenuOpen } = useApp();

  const lowStockCount = products.filter((p) => p.status === "Low Stock" || p.status === "Out of Stock").length;
  const expiringCount = products.filter((p) => p.status === "Expiring Soon" || p.status === "Expired").length;
  const overdueCustomerCount = customers.filter((c) => c.currentBalance > c.creditLimit).length;

  const navItems = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "Billing", label: "Billing & Invoices", icon: Receipt },
    { id: "Inventory", label: "Inventory", icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: "bg-amber-500" },
    { id: "Customers", label: "Customers & Ledger", icon: Users, badge: overdueCustomerCount > 0 ? overdueCustomerCount : undefined, badgeColor: "bg-red-500" },
    { id: "Reports", label: "Report Center", icon: FileSpreadsheet },
    { id: "Analytics", label: "Analytics & BI", icon: BarChart3 },
    { id: "AI Assistant", label: "AI Business Copilot", icon: Bot, badge: "AI", badgeColor: "bg-emerald-500" },
    { id: "Settings", label: "Settings & ERP Admin", icon: Settings },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen bg-slate-900 text-slate-100 transition-all duration-300 flex flex-col justify-between border-r border-slate-800 ${
          collapsed ? "w-20" : "w-64"
        } hidden md:flex`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-500/20 shrink-0">
                <Pill className="w-6 h-6" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <h1 className="font-bold text-base text-white tracking-wide leading-tight">QMMS ERP</h1>
                  <p className="text-xs text-emerald-400 font-medium truncate">Qadri Medical Agency</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* User Role Banner */}
          {!collapsed && (
            <div className="mx-3 my-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</p>
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{currentUser.role}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-slate-950" : "text-slate-400 group-hover:text-emerald-400"}`} />
                  {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

                  {/* Badge */}
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm shrink-0 ${
                        item.badgeColor || "bg-emerald-500"
                      } ${collapsed ? "absolute top-1 right-1 px-1.5 py-0.2" : ""}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {!collapsed && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <p className="font-medium text-[11px]">Server API Active</p>
                <p className="text-[10px] text-emerald-400/80 truncate">Gemini 3.6 Flash Ready</p>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileMenuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex md:hidden animate-fadeIn">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Drawer */}
            <div className="relative z-10 w-72 max-w-[85vw] h-full bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 p-4 shadow-2xl overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-500/20 shrink-0">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="font-bold text-base text-white tracking-wide leading-tight">QMMS ERP</h1>
                      <p className="text-xs text-emerald-400 font-medium">Qadri Medical Agency</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Role Banner */}
                <div className="my-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</p>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{currentUser.role}</span>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-1 mt-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                          isActive
                            ? "bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || "bg-emerald-500"}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Footer Info & Sign Out */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
