import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  X,
  Package,
  Users,
  Receipt,
  Building,
  Hash,
  ArrowRight,
  Pill,
} from "lucide-react";

export const GlobalSearchModal: React.FC = () => {
  const {
    globalSearchOpen,
    setGlobalSearchOpen,
    products,
    customers,
    invoices,
    setActiveTab,
  } = useApp();

  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setGlobalSearchOpen(true);
      } else if (e.key === "Escape" && globalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [globalSearchOpen, setGlobalSearchOpen]);

  if (!globalSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.genericName.toLowerCase().includes(q) ||
          p.companyName.toLowerCase().includes(q) ||
          p.batchNumber.toLowerCase().includes(q) ||
          p.barcode.includes(q)
      ).slice(0, 5)
    : [];

  const matchingCustomers = q
    ? customers.filter(
        (c) =>
          c.partyName.toLowerCase().includes(q) ||
          c.mobileNumber.includes(q) ||
          c.gstNumber.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchingInvoices = q
    ? invoices.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          i.salesperson.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3 bg-slate-50 dark:bg-slate-900">
          <Search className="w-5 h-5 text-emerald-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicine, customer, invoice #, batch or GSTIN..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
          />
          <button
            onClick={() => setGlobalSearchOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results list */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {!query && (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Pill className="w-8 h-8 text-emerald-500/40 mx-auto" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">Quick Global Search</p>
              <p>Type medicine name, customer, invoice number (e.g. QM-2026-1001), or batch code.</p>
            </div>
          )}

          {query && matchingProducts.length === 0 && matchingCustomers.length === 0 && matchingInvoices.length === 0 && (
            <div className="py-10 text-center text-slate-400 text-xs space-y-1">
              <p className="font-semibold text-slate-600 dark:text-slate-300">No matching records found for "{query}"</p>
              <p>Try searching for brand names, mobile numbers, or batch codes.</p>
            </div>
          )}

          {/* Products */}
          {matchingProducts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Package className="w-3.5 h-3.5 text-emerald-500" />
                <span>Medicines & Inventory ({matchingProducts.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActiveTab("Inventory");
                      setGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-100 dark:border-slate-800/80 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {p.companyName} | Batch: <span className="font-mono text-emerald-600 dark:text-emerald-400">{p.batchNumber}</span> | Exp: {p.expiryDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-slate-900 dark:text-white">₹{p.sellingRate.toFixed(2)}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                        Stock: {p.stockQuantity} {p.unit}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {matchingCustomers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Customers & Parties ({matchingCustomers.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveTab("Customers");
                      setGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800/80 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {c.partyName} ({c.code})
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Phone: {c.mobileNumber} | GSTIN: {c.gstNumber || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Outstanding</p>
                      <p className={`text-xs font-bold ${c.currentBalance > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                        ₹{c.currentBalance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {matchingInvoices.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Receipt className="w-3.5 h-3.5 text-amber-500" />
                <span>Invoices ({matchingInvoices.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingInvoices.map((i) => (
                  <div
                    key={i.id}
                    onClick={() => {
                      setActiveTab("Billing");
                      setGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-100 dark:border-slate-800/80 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        {i.invoiceNumber} - {i.customerName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Date: {i.date} | Payment: {i.paymentType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-slate-900 dark:text-white">₹{i.grandTotal.toFixed(2)}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                        {i.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
          <span>Press ESC to close</span>
          <span className="flex items-center space-x-1 text-emerald-500 font-semibold">
            <span>Powered by QMMS Search Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
