import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, LogOut, Shield, Mail, CheckCircle2, X } from "lucide-react";

export const UserProfileBadge: React.FC = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  const displayName = user.displayName || user.email?.split("@")[0] || "Pharmacist";
  const email = user.email || "";
  const photoUrl = user.photoURL;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2.5 p-1.5 pl-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all text-left group"
        title="Account Profile & Settings"
      >
        <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
          {photoUrl ? (
            <img src={photoUrl} alt={displayName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          ) : (
            <span>{displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="hidden sm:block min-w-0 pr-1">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px] leading-tight">
            {displayName}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[120px] leading-tight">
            {email}
          </p>
        </div>
      </button>

      {/* Popover Card */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 space-y-4 animate-fadeIn text-xs">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-sm flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {photoUrl ? (
                    <img src={photoUrl} alt={displayName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{email}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account Details Box */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Workspace ID</span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {user.uid.substring(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Cloud Storage</span>
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">Firestore Encrypted</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full py-2.5 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center justify-center space-x-2 transition-all"
            >
              {loggingOut ? (
                <div className="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Account</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
