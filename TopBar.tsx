import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { UserProfileBadge } from "../auth/UserProfileBadge";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  Clock,
  Sparkles,
} from "lucide-react";

interface TopBarProps {
  onOpenMobileMenu: () => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const {
    businessProfile,
    currentUser,
    setCurrentUser,
    users,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setGlobalSearchOpen,
    setAiDrawerOpen,
    setMobileMenuOpen,
    activeTab,
    isDarkMode,
    toggleDarkMode,
  } = useApp();

  const [timeString, setTimeString] = useState<string>("");
  const [notifDropdownOpen, setNotifDropdownOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Close dropdowns on navigation change
  useEffect(() => {
    setNotifDropdownOpen(false);
    setUserDropdownOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        }) +
          " " +
          now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between transition-colors shadow-xs">
      {/* Left Title / Search Trigger */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Mobile Menu Button */}
        <button
          onClick={() => {
            setMobileMenuOpen(true);
            if (onOpenMobileMenu) onOpenMobileMenu();
          }}
          className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-emerald-500" />
        </button>

        {/* Current Tab Breadcrumb Title */}
        <div className="hidden sm:block">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>{activeTab}</span>
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500">| {businessProfile.name}</span>
          </h2>
        </div>

        {/* Global Search Bar Trigger */}
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors text-xs font-medium w-44 sm:w-64"
        >
          <Search className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="truncate flex-1 text-left">Search medicine, customer, invoice...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded border border-slate-300 dark:border-slate-700">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Backdrop overlay for dropdowns */}
      {(notifDropdownOpen || userDropdownOpen) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setNotifDropdownOpen(false);
            setUserDropdownOpen(false);
          }}
        />
      )}

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Date & Time */}
        <div className="hidden xl:flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <Clock className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-medium">{timeString}</span>
        </div>

        {/* Floating AI Assistant Header Button */}
        <button
          onClick={() => setAiDrawerOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all font-semibold text-xs shadow-xs"
          title="Open AI Business Copilot"
        >
          <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
            )}
          </button>

          {/* Notifications Panel */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Alerts & Notifications</h3>
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">No notifications at the moment.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 rounded-xl border transition-all text-xs cursor-pointer ${
                        n.read
                          ? "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 text-slate-500 dark:text-slate-400"
                          : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200 font-medium"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Authenticated User Profile Badge */}
        <UserProfileBadge />
      </div>
    </header>
  );
};
