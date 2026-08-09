import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Zap,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle,
  Pill,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Database,
  Search,
  ShieldAlert,
} from "lucide-react";

export const AIAssistantDrawer: React.FC = () => {
  const {
    aiDrawerOpen,
    setAiDrawerOpen,
    products,
    customers,
    invoices,
    ledgerEntries,
    payments,
    setActiveTab,
    bulkImportProducts,
    clearProducts,
    clearCustomers,
    clearInvoices,
    clearLedgers,
    exportAllData,
    importAllData,
    resetToDefaultData,
  } = useApp();

  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSubView, setActiveSubView] = useState<"chat" | "dataMgmt">("chat");
  const [chatHistory, setChatHistory] = useState<
    { sender: "user" | "ai"; text: string; action?: any }[]
  >([
    {
      sender: "ai",
      text: "Hello! I am your QMMS AI Business Copilot. How can I assist you with sales, stock analysis, debtor tracking, or ERP actions today?",
    },
  ]);

  const [pasteImportOpen, setPasteImportOpen] = useState<boolean>(false);
  const [rawImportText, setRawImportText] = useState<string>("");
  const [importingText, setImportingText] = useState<boolean>(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  if (!aiDrawerOpen) return null;

  const lowStock = products.filter((p) => p.stockQuantity <= p.minStockLevel);
  const expiring = products.filter((p) => p.status === "Expiring Soon" || p.status === "Expired");
  const totalSalesToday = invoices
    .filter((i) => i.date === new Date().toLocaleDateString("en-CA"))
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const contextData = {
    totalProducts: products.length,
    lowStockCount: lowStock.length,
    expiringCount: expiring.length,
    totalSalesToday,
    totalCustomers: customers.length,
    topDebtors: customers
      .filter((c) => c.currentBalance > 0)
      .sort((a, b) => b.currentBalance - a.currentBalance)
      .slice(0, 5)
      .map((c) => ({ name: c.partyName, balance: c.currentBalance })),
  };

  const handleSend = async (customPrompt?: string) => {
    const queryText = customPrompt || prompt;
    if (!queryText.trim()) return;

    setChatHistory((prev) => [...prev, { sender: "user", text: queryText }]);
    if (!customPrompt) setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: queryText, contextData }),
      });
      const data = await res.json();

      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: data.text || "I have analyzed your request.", action: data.action },
      ]);

      if (data.action?.type === "NAVIGATE" && data.action.payload?.tab) {
        setActiveTab(data.action.payload.tab);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Analysis for "${queryText}":\n- Total Active Stock Items: ${products.length}\n- Low Stock Alerts: ${lowStock.length} items\n- Today's Sales: ₹${totalSalesToday.toFixed(2)}\n- Pending Receivables: ₹${customers.reduce((s, c) => s + c.currentBalance, 0).toFixed(2)}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractAndImportText = async () => {
    if (!rawImportText.trim()) return;
    setImportingText(true);

    try {
      const res = await fetch("/api/ai/extract-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: rawImportText }),
      });
      const data = await res.json();

      if (data.products && Array.isArray(data.products) && data.products.length > 0) {
        const result = bulkImportProducts(data.products);
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `🎉 Successfully parsed and imported ${result.imported} medicines into your inventory using AI! (${result.skipped} duplicates skipped)`,
          },
        ]);
        setPasteImportOpen(false);
        setRawImportText("");
      } else {
        alert("Could not extract medicines from provided text. Please ensure valid product names or bill text.");
      }
    } catch (error: any) {
      alert("Error extracting products: " + error.message);
    } finally {
      setImportingText(false);
    }
  };

  const triggerExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QMMS_ERP_Backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  const triggerImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          importAllData(evt.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight flex items-center space-x-1.5">
                <span>QMMS AI Copilot</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold uppercase">
                  Active
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Natural language ERP automation & control</p>
            </div>
          </div>
          <button
            onClick={() => setAiDrawerOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Copilot Chat vs AI Data Management */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-1 text-xs">
          <button
            onClick={() => setActiveSubView("chat")}
            className={`flex-1 py-1.5 font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              activeSubView === "chat"
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot Chat</span>
          </button>
          <button
            onClick={() => setActiveSubView("dataMgmt")}
            className={`flex-1 py-1.5 font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              activeSubView === "dataMgmt"
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>AI Data Management</span>
          </button>
        </div>

        {activeSubView === "chat" ? (
          <>
            {/* Quick Prompts Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs no-scrollbar">
              <button
                onClick={() => handleSend("Show low stock items and reorder list")}
                className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 shrink-0 font-medium flex items-center space-x-1"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Low Stock</span>
              </button>
              <button
                onClick={() => handleSend("Which customers have the highest pending balance?")}
                className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 shrink-0 font-medium flex items-center space-x-1"
              >
                <Users className="w-3 h-3" />
                <span>Top Debtors</span>
              </button>
              <button
                onClick={() => handleSend("What is today's total sales and profit overview?")}
                className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 shrink-0 font-medium flex items-center space-x-1"
              >
                <TrendingUp className="w-3 h-3" />
                <span>Today's Sales</span>
              </button>
              <button
                onClick={() => setPasteImportOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 shrink-0 font-medium flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Import</span>
              </button>
            </div>

            {/* Paste AI Import Popup inline */}
            {pasteImportOpen && (
              <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <Pill className="w-4 h-4 text-emerald-500" />
                    <span>AI Plain Text Medicine Importer</span>
                  </span>
                  <button onClick={() => setPasteImportOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={rawImportText}
                  onChange={(e) => setRawImportText(e.target.value)}
                  placeholder="Paste plain text list of medicines or bill lines here, e.g.:
Paracetamol 650mg Cipla Batch B2026-01 MRP 34 Rate 27 Stock 200
Augmentin 625 GSK Batch AG88 MRP 223 Stock 50"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleExtractAndImportText}
                  disabled={importingText || !rawImportText.trim()}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
                >
                  {importingText ? (
                    <span>AI Parsing & Extracting...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Extract & Import Into Stock</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex ${item.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      item.sender === "user"
                        ? "bg-emerald-500 text-slate-950 font-medium rounded-br-none"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-bl-none"
                    }`}
                  >
                    {item.sender === "ai" && (
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                        <Sparkles className="w-3 h-3" />
                        <span>QMMS AI Assistant</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line">{item.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-emerald-500 animate-spin" />
                    <span>AI is analyzing ERP data...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt Input Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask AI e.g. 'Show low stock' or 'Top debtors'..."
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* AI Data Management View */
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <h4 className="font-bold mb-1 flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-500" />
                <span>AI Data & Database Controls</span>
              </h4>
              <p className="text-[11px] leading-relaxed">
                Safely manage ERP datasets, perform backup exports, or execute selective table purges with full safety confirmation modals.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Selective Data Purge Actions</h5>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() =>
                    setConfirmModal({
                      open: true,
                      title: "Clear All Products",
                      message: "Are you sure you want to delete all medicine items from stock? This action cannot be undone.",
                      onConfirm: () => {
                        clearProducts();
                        setConfirmModal({ ...confirmModal, open: false });
                      },
                    })
                  }
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-500 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span>Clear Product Data ({products.length} Items)</span>
                  </span>
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </button>

                <button
                  onClick={() =>
                    setConfirmModal({
                      open: true,
                      title: "Clear All Customers",
                      message: "Are you sure you want to clear all chemist and customer party profiles? Existing invoices may become unlinked.",
                      onConfirm: () => {
                        clearCustomers();
                        setConfirmModal({ ...confirmModal, open: false });
                      },
                    })
                  }
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-500 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Clear Customer Data ({customers.length} Parties)</span>
                  </span>
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </button>

                <button
                  onClick={() =>
                    setConfirmModal({
                      open: true,
                      title: "Clear Invoice History",
                      message: "Are you sure you want to purge all sales invoice history records?",
                      onConfirm: () => {
                        clearInvoices();
                        setConfirmModal({ ...confirmModal, open: false });
                      },
                    })
                  }
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-500 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                    <span>Clear Invoice Data ({invoices.length} Bills)</span>
                  </span>
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </button>

                <button
                  onClick={() =>
                    setConfirmModal({
                      open: true,
                      title: "Clear Ledger & Payment Records",
                      message: "Are you sure you want to clear all payment collection logs and ledger entries?",
                      onConfirm: () => {
                        clearLedgers();
                        setConfirmModal({ ...confirmModal, open: false });
                      },
                    })
                  }
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-500 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <span>Clear Ledger Data ({ledgerEntries.length} Entries)</span>
                  </span>
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </button>

                <button
                  onClick={() =>
                    setConfirmModal({
                      open: true,
                      title: "Reset All Graphs & Analytics",
                      message: "This will purge all sales invoice history and payment ledgers. All revenue graphs, sales trends, and analytics charts will reset to 0, while preserving your product catalog and customer profiles. Proceed?",
                      onConfirm: () => {
                        clearInvoices();
                        clearLedgers();
                        setConfirmModal({ ...confirmModal, open: false });
                      },
                    })
                  }
                  className="w-full p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold flex items-center justify-between border border-amber-500/30 transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <span>Clear All ERP Data (Reset All Graphs & Analytics)</span>
                  </span>
                  <Trash2 className="w-4 h-4 text-amber-500" />
                </button>

                <button
                  onClick={() => setChatHistory([{ sender: "ai", text: "AI chat log cleared." }])}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-500 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-slate-400" />
                    <span>Clear AI Conversation Logs</span>
                  </span>
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h5 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Backup & System Clear</h5>
              <div className="space-y-2">
                <button
                  onClick={triggerExport}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Full System JSON Backup</span>
                </button>

                <label className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center space-x-2 cursor-pointer border border-slate-700">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Import Backup JSON File</span>
                  <input type="file" accept=".json" onChange={triggerImportFile} className="hidden" />
                </label>

                <button
                  onClick={() =>
                    setConfirmModal({
                      open: true,
                      title: "Clear All Data",
                      message: "WARNING: This will clear all data across the entire system (all products, customers, invoices, and ledgers). Everything you have created will be wiped clean. Proceed?",
                      onConfirm: () => {
                        clearInvoices();
                        clearLedgers();
                        clearCustomers();
                        clearProducts();
                        setConfirmModal({ ...confirmModal, open: false });
                      },
                    })
                  }
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center justify-center space-x-2 transition-all shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Data</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Safety Confirmation Modal */}
        {confirmModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-5 space-y-4">
              <div className="flex items-center space-x-2 text-rose-500">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <h4 className="font-bold text-sm">{confirmModal.title}</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
