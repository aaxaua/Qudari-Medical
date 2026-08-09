import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Building,
  FileText,
  Save,
  CheckCircle,
  Info,
  Database,
  Download,
  Upload,
  Shield,
  Eye,
  CreditCard,
  Printer,
  Sparkles,
} from "lucide-react";

export const SettingsView: React.FC = () => {
  const {
    businessProfile,
    setBusinessProfile,
    invoiceSettings,
    setInvoiceSettings,
    resetToDefaultData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"profile" | "about" | "invoice">("profile");

  const [profile, setProfile] = useState({
    name: businessProfile.name || "QADRI'S MEDICAL AGENCY",
    ownerName: businessProfile.ownerName || "Axim Raina",
    tagline: businessProfile.tagline || "Pharmaceutical Wholesalers & Distributors",
    gstin: businessProfile.gstin || businessProfile.gstNumber || "01AAAAA0000A1Z5",
    drugLicense20B: businessProfile.drugLicense20B || businessProfile.dlNumber || "AW2/15857/58",
    drugLicense21B: businessProfile.drugLicense21B || "RLF20B2022JK000809",
    panNumber: businessProfile.panNumber || "ABCDE1234F",
    fssaiNumber: businessProfile.fssaiNumber || "10020030004005",
    mobile: businessProfile.mobile || businessProfile.phone || "6006037028",
    whatsApp: businessProfile.whatsApp || "6006037028",
    email: businessProfile.email || "qadrimedicalagency@gmail.com",
    website: businessProfile.website || "www.qadrimedical.com",
    address: businessProfile.address || "Reshi Bazar",
    city: businessProfile.city || "Anantnag",
    state: businessProfile.state || "Jammu & Kashmir",
    pinCode: businessProfile.pinCode || "192101",
    country: businessProfile.country || "India",
    bankName: businessProfile.bankName || "J&K Bank Ltd.",
    accountNumber: businessProfile.accountNumber || "0018010100009988",
    ifscCode: businessProfile.ifscCode || "JAKA0RESANAG",
    upiId: businessProfile.upiId || "6006037028@jkb",
    terms: businessProfile.terms || "Goods once sold will not be taken back or exchanged. Subject to Anantnag jurisdiction.",
  });

  const [invSettings, setInvSettings] = useState({
    headerTitle: invoiceSettings.headerTitle || "TAX INVOICE",
    invoicePrefix: invoiceSettings.invoicePrefix || invoiceSettings.prefix || "QMA-2026-",
    terms: invoiceSettings.terms || profile.terms,
    signatoryLabel: invoiceSettings.signatoryLabel || `For ${profile.name.toUpperCase()}`,
    footerNote: invoiceSettings.footerNote || invoiceSettings.footerText || "Thank you for your business! - QMM(S) ERP System",
    showGstBreakup: invoiceSettings.showGstBreakup ?? true,
    showPreviousBalance: invoiceSettings.showPreviousBalance ?? true,
    showMrp: invoiceSettings.showMrp ?? true,
    showRate: invoiceSettings.showRate ?? true,
    roundOffEnabled: invoiceSettings.roundOffEnabled ?? true,
  });

  const [savedMsg, setSavedMsg] = useState<string>("");
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setBusinessProfile({
      ...businessProfile,
      ...profile,
      phone: profile.mobile,
      gstNumber: profile.gstin,
      dlNumber: profile.drugLicense20B,
    });
    setInvoiceSettings({
      ...invoiceSettings,
      ...invSettings,
      prefix: invSettings.invoicePrefix,
      footerText: invSettings.footerNote,
    });
    setSavedMsg("Settings & Invoice Configuration Saved Successfully!");
    setTimeout(() => setSavedMsg(""), 3500);
  };

  const handleExportBackup = () => {
    const data = localStorage.getItem("qmms_state_v1");
    if (!data) return;
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QMMS_ERP_Backup_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = evt.target?.result as string;
        localStorage.setItem("qmms_state_v1", json);
        alert("QMM(S) ERP Database restored successfully! Refreshing app...");
        window.location.reload();
      } catch (err) {
        alert("Invalid backup JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 pb-24 md:pb-8 animate-fadeIn max-w-7xl mx-auto w-full overflow-hidden">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Building className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0" />
            <span className="truncate">Settings & ERP Administration</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            100% customizable Business Profile, System Information & Live Invoice Setup.
          </p>
        </div>

        {savedMsg && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 animate-fadeIn shrink-0">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{savedMsg}</span>
          </div>
        )}
      </div>

      {/* THREE MAIN TAB BAR - Perfectly fitted, 0 overflow */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-full">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-1.5 sm:px-3 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold transition-all flex items-center justify-center space-x-1 sm:space-x-2 text-center leading-tight truncate cursor-pointer ${
            activeTab === "profile"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
          }`}
        >
          <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Business Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`px-1.5 sm:px-3 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold transition-all flex items-center justify-center space-x-1 sm:space-x-2 text-center leading-tight truncate cursor-pointer ${
            activeTab === "about"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
          }`}
        >
          <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">About System</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("invoice")}
          className={`px-1.5 sm:px-3 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold transition-all flex items-center justify-center space-x-1 sm:space-x-2 text-center leading-tight truncate cursor-pointer ${
            activeTab === "invoice"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
          }`}
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Invoice Setup</span>
        </button>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6 w-full">
        {/* ==================================================================== */}
        {/* TAB 1 — BUSINESS PROFILE & ERP CONFIGURATION */}
        {/* ==================================================================== */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-fadeIn w-full">
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center space-x-2">
                    <Building className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
                    <span>Business Profile & ERP Configuration</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage your agency identity, owner contact, regulatory details, address and bank accounts.
                  </p>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
                  Agency Master Record
                </span>
              </div>

              {/* 1. Business Identity Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center space-x-2">
                  <Building className="w-3.5 h-3.5 shrink-0" />
                  <span>1. Business Identity & Operations</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Agency / Business Name *</label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => {
                        setProfile({ ...profile, name: e.target.value });
                        setInvSettings({ ...invSettings, signatoryLabel: `For ${e.target.value.toUpperCase()}` });
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Business Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={profile.tagline}
                      onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                      placeholder="e.g. Pharmaceutical Wholesalers & Distributors"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Proprietor / Owner Name</label>
                    <input
                      type="text"
                      value={profile.ownerName}
                      onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Mobile Phone</label>
                    <input
                      type="text"
                      value={profile.mobile}
                      onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">WhatsApp Number</label>
                    <input
                      type="text"
                      value={profile.whatsApp}
                      onChange={(e) => setProfile({ ...profile, whatsApp: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">City & Location</label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">State & PIN Code</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="State"
                        value={profile.state}
                        onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                        className="w-2/3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
                      />
                      <input
                        type="text"
                        placeholder="PIN"
                        value={profile.pinCode}
                        onChange={(e) => setProfile({ ...profile, pinCode: e.target.value })}
                        className="w-1/3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Full Business Address</label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Regulatory & Tax Information */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center space-x-2">
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>2. Statutory & Licensing Compliance</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">GSTIN Number</label>
                    <input
                      type="text"
                      value={profile.gstin}
                      onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Drug License 20B</label>
                    <input
                      type="text"
                      value={profile.drugLicense20B}
                      onChange={(e) => setProfile({ ...profile, drugLicense20B: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Drug License 21B</label>
                    <input
                      type="text"
                      value={profile.drugLicense21B}
                      onChange={(e) => setProfile({ ...profile, drugLicense21B: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">PAN Number</label>
                    <input
                      type="text"
                      value={profile.panNumber}
                      onChange={(e) => setProfile({ ...profile, panNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Bank & Payment Accounts */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center space-x-2">
                  <CreditCard className="w-3.5 h-3.5 shrink-0" />
                  <span>3. Bank & Payment Settlement Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Bank Name</label>
                    <input
                      type="text"
                      value={profile.bankName}
                      onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Account Number</label>
                    <input
                      type="text"
                      value={profile.accountNumber}
                      onChange={(e) => setProfile({ ...profile, accountNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">IFSC Code</label>
                    <input
                      type="text"
                      value={profile.ifscCode}
                      onChange={(e) => setProfile({ ...profile, ifscCode: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">UPI ID / VPA</label>
                    <input
                      type="text"
                      value={profile.upiId}
                      onChange={(e) => setProfile({ ...profile, upiId: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button for Tab 1 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                Save updates to sync agency identity, phone numbers, licensing and bank settlement across all modules.
              </p>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>SAVE ALL CONFIGURATION SETTINGS</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2 — ABOUT QMM(S) ERP (DEVELOPER: AXIM RAINA) */}
        {/* ==================================================================== */}
        {activeTab === "about" && (
          <div className="space-y-6 animate-fadeIn w-full">
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl space-y-6 w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="font-extrabold text-base sm:text-lg text-white flex items-center space-x-2">
                    <Info className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>About QMM(S) ERP</span>
                  </h2>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    Qadri Medical Agency Management System
                  </p>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
                  Enterprise v1.4.2
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Overview Column */}
                <div className="lg:col-span-2 space-y-4 text-xs">
                  <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                    QMM(S) ERP is a business management platform designed to streamline the day-to-day operations of a medical/pharmaceutical distribution business through integrated billing, inventory, ledger, customer management, analytics, document generation, and intelligent assistance.
                  </p>

                  {/* Application Information Table */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">APP NAME</span>
                      <span className="font-bold text-emerald-400">QMM(S) ERP</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">PRODUCT</span>
                      <span className="font-bold text-white text-[10px] sm:text-[11px]">Qadri Medical Agency Management System</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">DEVELOPER</span>
                      <span className="font-extrabold text-emerald-300 text-xs">Axim Raina</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">VERSION</span>
                      <span className="font-bold text-emerald-400">v1.4.2 Enterprise</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">STATUS</span>
                      <span className="font-bold text-emerald-400 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                        <span>Operational</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">RELEASE YEAR</span>
                      <span className="font-bold text-emerald-400">2026</span>
                    </div>
                  </div>

                  {/* System Workflow Grid */}
                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-slate-200 text-xs">Core Integrated Modules:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                        <span className="font-bold text-emerald-400 block">Dashboard</span>
                        <span className="text-slate-400 text-[10px]">KPIs & Analytics</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                        <span className="font-bold text-emerald-400 block">Billing & Invoices</span>
                        <span className="text-slate-400 text-[10px]">GST & A4 Printing</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                        <span className="font-bold text-emerald-400 block">Inventory</span>
                        <span className="text-slate-400 text-[10px]">Batch & Expiry</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                        <span className="font-bold text-emerald-400 block">Ledger</span>
                        <span className="text-slate-400 text-[10px]">Party Balances</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Developer Card & Attribution */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-700/80 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">DEVELOPED BY</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-lg shadow-inner shrink-0">
                        AR
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-white tracking-wide">Axim Raina</h4>
                        <p className="text-[11px] text-emerald-400 font-mono">Lead Product Architect</p>
                      </div>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">
                      Designed and developed by Axim Raina with a focus on building practical, modern and user-friendly digital solutions for real-world business operations.
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <p className="text-[11px] font-bold text-slate-300">Key Focus Areas:</p>
                      <ul className="text-[11px] text-slate-400 space-y-1">
                        <li className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                          <span>Product & Interface Design</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                          <span>Business Workflow Development</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                          <span>Modern Digital Solutions</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                          <span>User-Centered Experience</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                          <span>Continuous Product Improvement</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 space-y-1 font-mono">
                    <p>© 2026 QMM(S) ERP. All rights reserved.</p>
                    <p className="text-emerald-400 font-bold">Developed by Axim Raina.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3 — INVOICE & DOCUMENT CUSTOMIZATION WITH LIVE RESPONSIVE PREVIEW */}
        {/* ==================================================================== */}
        {activeTab === "invoice" && (
          <div className="space-y-6 animate-fadeIn w-full">
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center space-x-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
                    <span>Invoice & Document Customization</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    100% customize invoice header titles, prefixes, terms, signatory labels and footer declarations.
                  </p>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center space-x-1 self-start sm:self-auto">
                  <Eye className="w-3 h-3 shrink-0" />
                  <span>Real-Time PDF Preview</span>
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Controls Column (5 cols) */}
                <div className="lg:col-span-5 space-y-4 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Invoice Header Title</label>
                    <input
                      type="text"
                      value={invSettings.headerTitle}
                      onChange={(e) => setInvSettings({ ...invSettings, headerTitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Invoice Number Prefix</label>
                    <input
                      type="text"
                      value={invSettings.invoicePrefix}
                      onChange={(e) => setInvSettings({ ...invSettings, invoicePrefix: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Authorized Signatory Label</label>
                    <input
                      type="text"
                      value={invSettings.signatoryLabel}
                      onChange={(e) => setInvSettings({ ...invSettings, signatoryLabel: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Invoice Terms & Conditions</label>
                    <textarea
                      rows={3}
                      value={invSettings.terms}
                      onChange={(e) => setInvSettings({ ...invSettings, terms: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Footer Notes / Declaration</label>
                    <input
                      type="text"
                      value={invSettings.footerNote}
                      onChange={(e) => setInvSettings({ ...invSettings, footerNote: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  {/* Document Feature Toggles */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="font-extrabold text-slate-700 dark:text-slate-300 text-xs">Document Display Options:</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <label className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={invSettings.showGstBreakup}
                          onChange={(e) => setInvSettings({ ...invSettings, showGstBreakup: e.target.checked })}
                          className="rounded text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-bold">Show GST Breakup</span>
                      </label>

                      <label className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={invSettings.showPreviousBalance}
                          onChange={(e) => setInvSettings({ ...invSettings, showPreviousBalance: e.target.checked })}
                          className="rounded text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-bold">Show Ledger Balance</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Live Invoice Preview Column (7 cols) - Completely scrollable & scalable container */}
                <div className="lg:col-span-7 space-y-2 w-full max-w-full overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Printer className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Live Invoice Document Preview</span>
                    </span>
                    <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-mono font-bold">Live Updates</span>
                  </div>

                  {/* Scrollable Container around mini A4 preview */}
                  <div className="p-2 sm:p-4 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto w-full max-w-full">
                    {/* Mini A4 Invoice Card Preview */}
                    <div className="min-w-[480px] sm:min-w-0 w-full p-4 sm:p-6 bg-white text-slate-900 border border-slate-300 rounded-xl shadow-lg font-sans text-[11px] space-y-4">
                      {/* Header Banner */}
                      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                        <div>
                          <h3 className="font-extrabold text-base tracking-tight text-slate-950 uppercase">
                            {profile.name || "QADRI'S MEDICAL AGENCY"}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-600">{profile.tagline || "Pharmaceutical Wholesalers & Distributors"}</p>
                          <p className="text-[10px] text-slate-600">
                            {profile.address || "Reshi Bazar"}, {profile.city || "Anantnag"} {profile.state || "Kashmir"} {profile.pinCode || "192101"}
                          </p>
                          <p className="text-[10px] text-slate-700 font-mono">
                            Cell: {profile.mobile || "6006037028"} | DL: {profile.drugLicense20B || "AW2/15857/58"} / {profile.drugLicense21B || "RLF20B2022JK000809"}
                          </p>
                        </div>
                        <div className="border border-slate-900 px-3 py-1 font-extrabold text-xs tracking-wider uppercase bg-slate-100 text-slate-900 shrink-0">
                          {invSettings.headerTitle || "TAX INVOICE"}
                        </div>
                      </div>

                      {/* Customer Meta Row */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded border border-slate-200 font-mono">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-sans">Billed To (Party)</span>
                          <strong className="text-slate-900 font-sans text-[11px]">Bhat Medicos (Retailer)</strong>
                          <p className="text-slate-600">DL: 20B/102938 | Phone: 9906112233</p>
                        </div>
                        <div className="text-right">
                          <p><span className="text-slate-500">Invoice No:</span> <strong className="text-emerald-700">{invSettings.invoicePrefix || "QMA-2026-"}00184</strong></p>
                          <p><span className="text-slate-500">Date:</span> {new Date().toLocaleDateString("en-IN")}</p>
                          <p><span className="text-slate-500">GSTIN:</span> {profile.gstin || "01AAAAA0000A1Z5"}</p>
                        </div>
                      </div>

                      {/* Items Table Mock */}
                      <table className="w-full text-[10px] text-left border-collapse border border-slate-300">
                        <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[9px]">
                          <tr className="divide-x divide-slate-300 border-b border-slate-300">
                            <th className="p-1">Description</th>
                            <th className="p-1 font-mono">Batch</th>
                            <th className="p-1 font-mono">Exp</th>
                            <th className="p-1 text-right font-mono">Qty</th>
                            <th className="p-1 text-right font-mono">Rate</th>
                            <th className="p-1 text-right font-mono">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono text-[10px]">
                          <tr className="divide-x divide-slate-200">
                            <td className="p-1 font-sans font-bold">Paracetamol 650mg 10x10</td>
                            <td className="p-1">B2026-99</td>
                            <td className="p-1">12/28</td>
                            <td className="p-1 text-right">100</td>
                            <td className="p-1 text-right">₹28.00</td>
                            <td className="p-1 text-right font-bold">₹2,800.00</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Bank Details & Terms Footer Row */}
                      <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[10px] font-mono grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] uppercase font-bold font-sans text-slate-600 block">Bank Settlement Account</span>
                          <span className="font-bold text-slate-900 block">{profile.bankName}</span>
                          <span className="text-slate-700 block">A/C: {profile.accountNumber}</span>
                          <span className="text-slate-700 block">IFSC: {profile.ifscCode}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold font-sans text-slate-600 block">UPI Payment VPA</span>
                          <span className="font-bold text-emerald-700 block">{profile.upiId}</span>
                        </div>
                      </div>

                      {/* Summary & Signatory Footer */}
                      <div className="flex justify-between items-end pt-2 text-[10px] border-t border-slate-300">
                        <div className="max-w-[55%] space-y-1">
                          <span className="font-bold block text-[9px] uppercase text-slate-700">Terms & Conditions:</span>
                          <p className="text-[9px] text-slate-600 leading-tight">
                            {invSettings.terms || profile.terms}
                          </p>
                          <p className="text-[9px] font-bold text-slate-700 pt-1">
                            {invSettings.footerNote || "Thank you for your business!"}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-xs font-bold font-mono text-slate-900">Grand Total: ₹11,050.00</p>
                          <div className="pt-4 font-bold text-slate-900">
                            {invSettings.signatoryLabel || `For ${profile.name.toUpperCase()}`}
                          </div>
                          <p className="text-[9px] text-slate-500 uppercase">Authorised Signatory</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button for Tab 3 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                Save updates to persist Header Titles, Prefixes, Signatory Labels, Terms and Footer declarations.
              </p>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>SAVE ALL CONFIGURATION SETTINGS</span>
              </button>
            </div>
          </div>
        )}
      </form>

      {/* ==================================================================== */}
      {/* SECONDARY SYSTEM DATA TOOLS (SEPARATE AT BOTTOM) */}
      {/* ==================================================================== */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 w-full overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-500 shrink-0" />
            <span>System Data & Maintenance Tools</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Offline Backup & Database Safeguards</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Export a full offline JSON backup of your medicine catalog, customer ledger balances, and invoices for safekeeping.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Export Database Backup (.JSON)</span>
          </button>

          <label className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-2 cursor-pointer transition-all border border-slate-200 dark:border-slate-700">
            <Upload className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Restore From File</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs flex items-center space-x-2 border border-rose-500/30 transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-base text-rose-500 flex items-center space-x-2">
              <Shield className="w-5 h-5 shrink-0" />
              <span>Confirm System Reset</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to reset all data (medicines, customer accounts, ledgers, and invoices) back to default initial state?
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDefaultData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
