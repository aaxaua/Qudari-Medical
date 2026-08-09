import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../../context/AppContext";
import { Invoice, InvoiceItem, Customer, Product, PaymentMode } from "../../types";
import { generateInvoicePDF, numberToWords } from "../../lib/pdfGenerator";
import { getPartyImage } from "../../lib/avatarPresets";
import {
  Receipt,
  Plus,
  Search,
  Trash2,
  Printer,
  Download,
  Share2,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  UserPlus,
  Pill,
  RotateCcw,
  Ban,
  Edit,
  Package,
  MapPin,
  Building,
  Check,
  Percent,
  Eye,
  FileCheck,
} from "lucide-react";

export const BillingView: React.FC = () => {
  const {
    invoices,
    customers,
    products,
    addInvoice,
    cancelInvoice,
    markInvoiceSucceeded,
    returnInvoice,
    addCustomer,
    updateProduct,
    businessProfile,
    invoiceSettings,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"Create" | "History">("Create");

  // Create Invoice State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState<string>("");
  const [newCustPhone, setNewCustPhone] = useState<string>("");
  const [newCustGst, setNewCustGst] = useState<string>("");
  const [newCustAddress, setNewCustAddress] = useState<string>("");

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [productSearch, setProductSearch] = useState<string>("");

  const [paymentType, setPaymentType] = useState<PaymentMode | "Credit">("Cash");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [invoiceDate, setInvoiceDate] = useState<string>(() => new Date().toLocaleDateString("en-CA"));

  // Custom GST % State for Invoice
  const [appliedCustomGst, setAppliedCustomGst] = useState<number | null>(null);

  // Detail Modal State
  const [viewInvoiceModal, setViewInvoiceModal] = useState<Invoice | null>(null);
  const [cancelModalInvoice, setCancelModalInvoice] = useState<Invoice | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");

  // Editing Items & Master Product in Billing State
  const [editingCartItemIndex, setEditingCartItemIndex] = useState<number | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<InvoiceItem | null>(null);
  const [editingMasterProduct, setEditingMasterProduct] = useState<Product | null>(null);

  // Custom GST Rate Toolbar State
  const [showCustomGstModal, setShowCustomGstModal] = useState<boolean>(false);
  const [customGstInputValue, setCustomGstInputValue] = useState<string>("3");

  // Search/Filter for History
  const [historySearch, setHistorySearch] = useState<string>("");
  const [historyStatus, setHistoryStatus] = useState<string>("All");

  // Apply Custom GST to All Current Items on Invoice
  const applyCustomGstToAll = (rate: number | null) => {
    setAppliedCustomGst(rate);
    if (rate !== null) {
      setItems((prevItems) =>
        prevItems.map((it) => {
          const updated = { ...it, gstPercent: rate };
          updated.amount = calculateRowAmount(updated);
          return updated;
        })
      );
    }
  };

  // Inline Product Add To Table
  const handleSelectProduct = (prod: Product) => {
    if (prod.stockQuantity <= 0) {
      alert(`'${prod.name}' is currently Out of Stock!`);
      return;
    }

    const targetGst = appliedCustomGst !== null ? appliedCustomGst : prod.gstPercent;

    const existingIndex = items.findIndex((i) => i.productId === prod.id);
    if (existingIndex > -1) {
      const updated = [...items];
      if (updated[existingIndex].qty + 1 > prod.stockQuantity) {
        alert(`Cannot add more than available stock (${prod.stockQuantity})`);
        return;
      }
      updated[existingIndex].qty += 1;
      if (appliedCustomGst !== null) {
        updated[existingIndex].gstPercent = appliedCustomGst;
      }
      updated[existingIndex].amount = calculateRowAmount(updated[existingIndex]);
      setItems(updated);
    } else {
      const newItem: InvoiceItem = {
        id: "item_" + Date.now() + Math.random(),
        productId: prod.id,
        productName: prod.name,
        batchNumber: prod.batchNumber,
        expiryDate: prod.expiryDate,
        qty: 1,
        freeQty: 0,
        mrp: prod.mrp,
        sellingRate: prod.sellingRate,
        discountPercent: prod.discountPercent,
        gstPercent: targetGst,
        amount: 0,
      };
      newItem.amount = calculateRowAmount(newItem);
      setItems([...items, newItem]);
    }
    setProductSearch("");
  };

  const calculateRowAmount = (item: InvoiceItem): number => {
    const base = item.qty * item.sellingRate;
    const discountVal = (base * item.discountPercent) / 100;
    const afterDisc = base - discountVal;
    const gstVal = (afterDisc * item.gstPercent) / 100;
    return afterDisc + gstVal;
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const prod = products.find((p) => p.id === updated[index].productId);

    if (field === "qty" && prod && value > prod.stockQuantity) {
      alert(`Maximum available stock is ${prod.stockQuantity}`);
      value = prod.stockQuantity;
    }

    (updated[index] as any)[field] = Number(value) || value;
    updated[index].amount = calculateRowAmount(updated[index]);
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.sellingRate, 0);

  const totalDiscount =
    items.reduce((sum, item) => {
      const base = item.qty * item.sellingRate;
      return sum + (base * item.discountPercent) / 100;
    }, 0) + invoiceDiscount;

  const totalGst = items.reduce((sum, item) => {
    const base = item.qty * item.sellingRate;
    const disc = (base * item.discountPercent) / 100;
    return sum + ((base - disc) * item.gstPercent) / 100;
  }, 0);

  const netAmount = subtotal - totalDiscount + totalGst;
  const roundOff = Math.round(netAmount) - netAmount;
  const grandTotal = Math.round(netAmount);

  const prevBalance = selectedCustomer ? selectedCustomer.currentBalance : 0;
  const pendingBalance = Math.max(0, grandTotal - paidAmount);

  // Save Customer Inline
  const handleSaveInlineCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      alert("Please fill customer name and phone number.");
      return;
    }

    const created = addCustomer({
      partyName: newCustName,
      contactPerson: newCustName,
      mobileNumber: newCustPhone,
      whatsAppNumber: newCustPhone,
      email: `${newCustName.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
      gstNumber: newCustGst,
      drugLicenseNumber: "WLF-20B-NEW / WLF-21B-NEW",
      panNumber: "",
      billingAddress: newCustAddress || "Anantnag, Jammu & Kashmir",
      shippingAddress: newCustAddress || "Anantnag, Jammu & Kashmir",
      city: "Anantnag",
      state: "Jammu & Kashmir",
      pinCode: "192101",
      creditLimit: 50000,
      openingBalance: 0,
      paymentTerms: "15 Days",
      businessCategory: "Retail Store",
      status: "Active",
    });

    setSelectedCustomer(created);
    setShowAddCustomerModal(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewCustGst("");
    setNewCustAddress("");
  };

  // Save Invoice Submit
  const handleSaveInvoice = (andPrint: boolean = false) => {
    if (!selectedCustomer) {
      alert("Please select a customer for the invoice.");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one product to the invoice.");
      return;
    }

    let status: Invoice["status"] = "Pending";
    if (paidAmount >= grandTotal) status = "Paid";
    else if (paidAmount > 0) status = "Partially Paid";

    const created = addInvoice({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.partyName,
      customerPhone: selectedCustomer.mobileNumber,
      customerGst: selectedCustomer.gstNumber,
      customerAddress: selectedCustomer.billingAddress,
      date: invoiceDate || new Date().toLocaleDateString("en-CA"),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      salesperson: "Abdul Qadri",
      items,
      subtotal,
      discountAmount: totalDiscount,
      gstAmount: totalGst,
      roundOff,
      previousBalance: prevBalance,
      netAmount,
      paidAmount,
      pendingBalance,
      grandTotal,
      paymentType,
      status,
      termsAndConditions: invoiceSettings.terms,
    });

    if (andPrint) {
      generateInvoicePDF(created, businessProfile, selectedCustomer);
    }

    // Reset Form
    setItems([]);
    setPaidAmount(0);
    setInvoiceDiscount(0);
    setActiveSubTab("History");
  };

  // Determine effective status (Auto-Succeed if paid, pending <= 0 or customer balance is cleared)
  const getEffectiveStatus = (inv: Invoice): "Paid" | "Partially Paid" | "Pending" | "Cancelled" => {
    if (inv.status === "Cancelled") return "Cancelled";
    if (inv.status === "Paid" || inv.pendingBalance <= 0.01) return "Paid";
    const cust = customers.find((c) => c.id === inv.customerId);
    if (cust && cust.currentBalance <= 0) return "Paid";
    if (inv.paidAmount > 0) return "Partially Paid";
    return "Pending";
  };

  // Filtered History
  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
      i.customerName.toLowerCase().includes(historySearch.toLowerCase()) ||
      i.salesperson.toLowerCase().includes(historySearch.toLowerCase());
    const effStatus = getEffectiveStatus(i);
    const matchesStatus = historyStatus === "All" || effStatus === historyStatus;
    return matchesSearch && matchesStatus;
  });

  const matchingProductsForSearch = productSearch.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.batchNumber.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.companyName.toLowerCase().includes(productSearch.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6 animate-fadeIn">
      {/* Top Header & SubTabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-emerald-500" />
            <span>Billing & Invoice Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Professional pharmacy billing, stock reduction, tax invoice PDF generation & customer credit sync.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveSubTab("Create")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "Create"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            + Create New Invoice
          </button>
          <button
            onClick={() => setActiveSubTab("History")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "History"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Invoice History ({invoices.length})
          </button>
        </div>
      </div>

      {activeSubTab === "Create" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Billing Table & Product Search (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer / Party Selection Card - Compact & Low Height */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 text-white shadow-md space-y-2.5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                {/* Party Selector Header */}
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-xs text-white truncate">Party & Customer Selector</span>
                  {selectedCustomer && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                      {selectedCustomer.code}
                    </span>
                  )}
                </div>

                {/* Right Header Actions: Party Dropdown + New Party Button */}
                <div className="flex items-center space-x-2 shrink-0">
                  <select
                    value={selectedCustomer?.id || ""}
                    onChange={(e) => {
                      const found = customers.find((c) => c.id === e.target.value);
                      if (found) setSelectedCustomer(found);
                    }}
                    className="p-1.5 text-xs font-bold rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.partyName} ({c.mobileNumber})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowAddCustomerModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] flex items-center space-x-1 transition-all shadow-xs"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ New Party</span>
                  </button>
                </div>
              </div>

              {/* Selected Customer Compact Details Row */}
              {selectedCustomer && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-emerald-500/80 shrink-0 bg-slate-950">
                      <img
                        src={getPartyImage(selectedCustomer.profileImage)}
                        alt={selectedCustomer.partyName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs truncate">{selectedCustomer.partyName}</span>
                        <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                          GSTIN: {selectedCustomer.gstNumber || "URP"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 truncate">
                        {selectedCustomer.mobileNumber} • {selectedCustomer.billingAddress || selectedCustomer.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Prev Balance</span>
                      <span className={`text-xs font-black ${selectedCustomer.currentBalance > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        ₹{selectedCustomer.currentBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom GST Rate Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-800/60 text-[11px]">
                <div className="flex items-center space-x-1 text-slate-300 font-bold">
                  <Percent className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px]">Apply Invoice GST Rate:</span>
                  {appliedCustomGst !== null && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                      {appliedCustomGst}% Applied
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
                  {[0, 5, 12, 18, 28].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => applyCustomGstToAll(rate)}
                      className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold transition-all border ${
                        appliedCustomGst === rate
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomGstModal(true);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all border ${
                      appliedCustomGst !== null && ![0, 5, 12, 18, 28].includes(appliedCustomGst)
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm"
                        : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {appliedCustomGst !== null && ![0, 5, 12, 18, 28].includes(appliedCustomGst)
                      ? `Custom (${appliedCustomGst}%)`
                      : "Custom %"}
                  </button>

                  {appliedCustomGst !== null && (
                    <button
                      type="button"
                      onClick={() => applyCustomGstToAll(null)}
                      className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-rose-400 border border-slate-700 hover:bg-rose-500/20 transition-all"
                      title="Reset items to default master GST"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal for Typing Manual Custom GST % - Rendered at root via portal */}
            {showCustomGstModal && createPortal(
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                      <Percent className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>Set Custom Invoice GST %</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomGstModal(false)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Select a quick preset or type any custom GST percentage (e.g. 1%, 2.5%, 3%, 6%, 7.5%, 15%). It will be applied directly to all products on this invoice.
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = parseFloat(customGstInputValue);
                      if (!isNaN(val) && val >= 0) {
                        applyCustomGstToAll(val);
                        setShowCustomGstModal(false);
                      } else {
                        alert("Please enter a valid positive GST percentage.");
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Custom GST Percentage (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          max="100"
                          autoFocus
                          value={customGstInputValue}
                          onChange={(e) => setCustomGstInputValue(e.target.value)}
                          placeholder="e.g. 1, 2.5, 3, 6, 7.5"
                          className="w-full px-4 py-3 text-base font-mono font-extrabold rounded-2xl border-2 border-emerald-500/50 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <span className="absolute right-4 top-3 text-sm font-extrabold text-emerald-500 font-mono">%</span>
                      </div>
                    </div>

                    {/* Quick presets for common custom rates */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-bold block">Quick Tap Presets:</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[0, 1, 2.5, 3, 5, 6, 7.5, 12, 18, 28].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setCustomGstInputValue(preset.toString())}
                            className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                              customGstInputValue === preset.toString()
                                ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {preset}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          applyCustomGstToAll(null);
                          setShowCustomGstModal(false);
                        }}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-rose-500 hover:bg-rose-500/10 font-bold text-xs rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                      >
                        Reset to Default
                      </button>

                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowCustomGstModal(false)}
                          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply GST</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}

            {/* Product Autocomplete Search Bar */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 relative">
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Scan barcode or search medicine by name, brand, company, batch..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Product Autocomplete Dropdown */}
              {matchingProductsForSearch.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-1 space-y-1">
                  {matchingProductsForSearch.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {p.companyName} | Batch: <span className="text-emerald-500 font-mono">{p.batchNumber}</span> | Exp: {p.expiryDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white">₹{p.sellingRate.toFixed(2)}</p>
                        <p className={`text-[10px] font-bold ${p.stockQuantity > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                          Stock: {p.stockQuantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Table / Items List */}
            <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              {/* Mobile Card List (xs screens) */}
              <div className="block sm:hidden space-y-3">
                {items.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <Pill className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-medium text-xs">No items added to bill yet.</p>
                    <p className="text-[10px]">Use search bar above to add medicines.</p>
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{item.productName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Batch: {item.batchNumber} | Exp: {item.expiryDate}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingCartItemIndex(idx);
                              setEditingCartItem({ ...item });
                            }}
                            className="p-1 text-slate-500 hover:text-emerald-500 rounded-lg"
                            title="Edit Item Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/50 text-[11px]">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(idx, "qty", e.target.value)}
                            className="w-full p-1 text-center font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase">Free</label>
                          <input
                            type="number"
                            min="0"
                            value={item.freeQty}
                            onChange={(e) => handleUpdateItem(idx, "freeQty", e.target.value)}
                            className="w-full p-1 text-center font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase">Rate (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.sellingRate}
                            onChange={(e) => handleUpdateItem(idx, "sellingRate", e.target.value)}
                            className="w-full p-1 text-center font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase">Disc %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent}
                            onChange={(e) => handleUpdateItem(idx, "discountPercent", e.target.value)}
                            className="w-full p-1 text-center font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/50">
                        <span className="text-[10px] text-slate-400">Line Amount:</span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                          ₹{item.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Tablet & Desktop Table View (sm screens and above) */}
              <div className="hidden sm:block overflow-x-hidden">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2 px-1.5">Product</th>
                      <th className="py-2 px-1.5">Batch / Exp</th>
                      <th className="py-2 px-1 text-center w-12 sm:w-16">Qty</th>
                      <th className="py-2 px-1 text-center w-12 sm:w-16">Free</th>
                      <th className="py-2 px-1.5 text-right w-20 sm:w-24">Rate (₹)</th>
                      <th className="py-2 px-1 text-center w-14 sm:w-16">Disc %</th>
                      <th className="py-2 px-1.5 text-right w-20 sm:w-24">Amount (₹)</th>
                      <th className="py-2 px-1 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-400 space-y-2">
                          <Pill className="w-7 h-7 text-slate-300 mx-auto" />
                          <p className="font-medium text-xs">No items added to bill yet.</p>
                          <p className="text-[11px]">Use the search bar above to search & add medicines.</p>
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-1.5 font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                            {item.productName}
                          </td>
                          <td className="py-2 px-1.5 text-[11px] text-slate-400 font-mono whitespace-nowrap">
                            {item.batchNumber} <span className="text-[10px] text-slate-500">({item.expiryDate})</span>
                          </td>
                          <td className="py-2 px-1 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleUpdateItem(idx, "qty", e.target.value)}
                              className="w-11 sm:w-14 p-1 text-center font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <input
                              type="number"
                              min="0"
                              value={item.freeQty}
                              onChange={(e) => handleUpdateItem(idx, "freeQty", e.target.value)}
                              className="w-11 sm:w-14 p-1 text-center font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-1.5 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={item.sellingRate}
                              onChange={(e) => handleUpdateItem(idx, "sellingRate", e.target.value)}
                              className="w-16 sm:w-20 p-1 text-right font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent}
                              onChange={(e) => handleUpdateItem(idx, "discountPercent", e.target.value)}
                              className="w-11 sm:w-14 p-1 text-center font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-1.5 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            ₹{item.amount.toFixed(2)}
                          </td>
                          <td className="py-2 px-1 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => {
                                  setEditingCartItemIndex(idx);
                                  setEditingCartItem({ ...item });
                                }}
                                className="p-1 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                                title="Edit All Item Details"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                                title="Remove Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Summary & Checkout Card (Right 1 col) */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Invoice Calculation Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span className="font-bold">TOTAL ({items.length} items)</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{grandTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span className="font-bold">LAST BALANCE</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{(selectedCustomer?.currentBalance || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full p-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Cash">Cash Payment</option>
                    <option value="UPI">UPI Digital Payment</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Credit">Credit Sale (Add to Ledger)</option>
                    <option value="Mixed">Mixed Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Paid Amount Received (₹)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                    placeholder="Enter cash/UPI received"
                    className="w-full p-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Pending Balance Added to Party Ledger:</span>
                    <span className="text-rose-500 font-extrabold">₹{pendingBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleSaveInvoice(true)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                >
                  <Printer className="w-4 h-4" />
                  <span>Save & Print Invoice PDF</span>
                </button>

                <button
                  onClick={() => handleSaveInvoice(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Save Invoice To Database</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice History SubTab */}
      {activeSubTab === "History" && (
        <div className="space-y-4">
          {/* History Search & Filters */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search invoice #, party name, phone..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-medium shrink-0">Filter Status:</span>
              <select
                value={historyStatus}
                onChange={(e) => setHistoryStatus(e.target.value)}
                className="p-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="All">All Invoices</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Mobile & Tablet Card View (below lg screens) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {filteredInvoices.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Invoices Found</p>
                <p className="text-xs text-slate-400">Try adjusting your search query or status filter.</p>
              </div>
            ) : (
              filteredInvoices.map((inv) => {
                const customerObj = customers.find((c) => c.id === inv.customerId);
                const effStatus = getEffectiveStatus(inv);
                const isSucceeded = effStatus === "Paid";

                return (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 hover:border-emerald-500/50 transition-all"
                  >
                    {/* Header: Agency Logo & Invoice Number */}
                    <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-extrabold text-emerald-500 text-xs shrink-0 shadow-xs">
                          QMA
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                            {businessProfile.name || "QADRI'S MEDICAL AGENCY"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Bill #{inv.invoiceNumber} • {inv.date}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full font-black text-[10px] shrink-0 flex items-center space-x-1 ${
                          isSucceeded
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : effStatus === "Cancelled"
                            ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {isSucceeded && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                        <span>{isSucceeded ? "Succeeded / Paid" : effStatus}</span>
                      </span>
                    </div>

                    {/* Wide Party Record Card Body */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Party / Chemist Record</span>
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs block">M/s {inv.customerName}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Grand Total</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm block">₹{inv.grandTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 font-mono text-slate-600 dark:text-slate-300">
                        <div>
                          <span className="text-slate-400 text-[10px] block font-sans">Contact & City</span>
                          <span className="truncate block font-semibold">{customerObj?.mobileNumber || inv.customerPhone || "N/A"}</span>
                          <span className="truncate block text-[10px] text-slate-400">{inv.customerAddress || "Anantnag, J&K"}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] block font-sans">DL / GSTIN</span>
                          <span className="block truncate font-semibold">DL: {customerObj?.dlNumber || "20B/102938"}</span>
                          <span className="block truncate font-semibold">GST: {customerObj?.gstNumber || "01AAAAA0000A1Z5"}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                        <span className="text-slate-400">Payment Paid: <strong className="text-emerald-600 dark:text-emerald-400">₹{(isSucceeded ? inv.grandTotal : inv.paidAmount).toFixed(2)}</strong></span>
                        <span className="text-slate-400">Pending Bal: <strong className={isSucceeded ? "text-emerald-500" : "text-rose-500"}>₹{(isSucceeded ? 0 : inv.pendingBalance).toFixed(2)}</strong></span>
                      </div>
                    </div>

                    {/* Action Toolbar: View PDF, Download PDF, Succeed & Cancel */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {!isSucceeded && effStatus !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => markInvoiceSucceeded(inv.id)}
                          className="w-full sm:w-auto flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Succeeded</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setViewInvoiceModal(inv)}
                        className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all border border-slate-200 dark:border-slate-700"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        <span>View PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => generateInvoicePDF(inv, businessProfile, customerObj)}
                        className="flex-1 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all border border-emerald-500/20"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>

                      {effStatus !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => setCancelModalInvoice(inv)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs rounded-xl transition-all border border-rose-500/20 shrink-0"
                          title="Cancel Invoice"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View (lg screens and above) */}
          <div className="hidden lg:block p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Invoice & Agency</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Customer / Party Record</th>
                  <th className="py-3 px-3 text-right">Grand Total (₹)</th>
                  <th className="py-3 px-3 text-right">Pending (₹)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Document Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredInvoices.map((inv) => {
                  const customerObj = customers.find((c) => c.id === inv.customerId);
                  const effStatus = getEffectiveStatus(inv);
                  const isSucceeded = effStatus === "Paid";

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-extrabold text-emerald-500 text-[11px] shrink-0 shadow-xs">
                            QMA
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white font-mono block">Bill #{inv.invoiceNumber}</span>
                            <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">{businessProfile.name || "Qadri Medical"}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <span className="font-medium block">{inv.date}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{inv.time}</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-900 dark:text-white block">M/s {inv.customerName}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            DL: {customerObj?.dlNumber || "20B/102938"} • Ph: {customerObj?.mobileNumber || inv.customerPhone || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white text-sm">
                        ₹{inv.grandTotal.toFixed(2)}
                      </td>

                      <td className={`py-3 px-3 text-right font-bold ${isSucceeded ? "text-emerald-500" : "text-rose-500"}`}>
                        ₹{(isSucceeded ? 0 : inv.pendingBalance).toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full font-black text-[10px] inline-flex items-center space-x-1 ${
                            isSucceeded
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : effStatus === "Cancelled"
                              ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {isSucceeded && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                          <span>{isSucceeded ? "Succeeded" : effStatus}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {!isSucceeded && effStatus !== "Cancelled" && (
                            <button
                              type="button"
                              onClick={() => markInvoiceSucceeded(inv.id)}
                              className="px-2 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-[11px] flex items-center space-x-1 transition-all shadow-xs"
                              title="Mark Invoice as Succeeded / Paid"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Succeed</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setViewInvoiceModal(inv)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center space-x-1 transition-all border border-slate-200 dark:border-slate-700"
                            title="View Full PDF & Invoice Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            <span>View PDF</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => generateInvoicePDF(inv, businessProfile, customerObj)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center space-x-1 transition-all border border-emerald-500/20"
                            title="Download PDF File"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>

                          {effStatus !== "Cancelled" && (
                            <button
                              type="button"
                              onClick={() => setCancelModalInvoice(inv)}
                              className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20"
                              title="Cancel Invoice"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Invoice Detail Modal */}
      {viewInvoiceModal && (() => {
        const modalCustomer = customers.find((c) => c.id === viewInvoiceModal.customerId) || {
          partyName: viewInvoiceModal.customerName,
          billingAddress: viewInvoiceModal.customerAddress,
          mobileNumber: viewInvoiceModal.customerPhone,
          currentBalance: viewInvoiceModal.previousBalance || 0,
        };
        const subtotalUpToDate = (viewInvoiceModal.previousBalance || 0) + viewInvoiceModal.grandTotal;

        return createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <div className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            {/* Invoice Printable View Container */}
            <div className="border border-slate-300 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-900 space-y-4 text-xs text-slate-900 dark:text-slate-100">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-xl font-black tracking-wide text-slate-900 dark:text-white uppercase">
                    QADRI'S MEDICAL AGENCY
                  </h2>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Pharmaceutical Distributors
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Reshi Bazar, Anantnag Kashmir 192101
                  </p>
                  <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 pt-0.5">
                    Cell: 6006037028, 8899464931 | D.L. No: AW2/15857/58 | D.L. No: RLF20B2022JK000809
                  </p>
                </div>
                <div className="border-2 border-slate-900 dark:border-slate-100 px-3 py-1.5 rounded-lg text-center bg-slate-50 dark:bg-slate-800">
                  <span className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">INVOICE</span>
                </div>
              </div>

              {/* WIDE PARTY CARD - Professional Wide ERP Record Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                  <span className="text-[10px] uppercase font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center space-x-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>PARTY / CUSTOMER RECORD</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    Bill #{viewInvoiceModal.invoiceNumber}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">Customer Name</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm block truncate">M/s {modalCustomer.partyName}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Phone: {modalCustomer.mobileNumber || "N/A"}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">Licenses & Tax</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 block text-[11px]">DL: {modalCustomer.dlNumber || "20B/102938"}</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 block text-[11px]">GSTIN: {modalCustomer.gstNumber || "01AAAAA0000A1Z5"}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">Billing Address</span>
                    <span className="text-slate-700 dark:text-slate-300 block text-[11px] leading-tight break-words">{modalCustomer.billingAddress || "Reshi Bazar, Anantnag"}</span>
                  </div>

                  <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700/60 pt-2 sm:pt-0 sm:pl-3 space-y-0.5 font-mono text-[11px]">
                    <p><span className="text-slate-400 font-sans">Invoice Date:</span> <span className="font-bold text-slate-900 dark:text-white">{viewInvoiceModal.date} ({viewInvoiceModal.time || "12:00 PM"})</span></p>
                    <p><span className="text-slate-400 font-sans">Bill Total:</span> <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{viewInvoiceModal.grandTotal.toFixed(2)}</span></p>
                    <p><span className="text-slate-400 font-sans">Last Balance:</span> <span className="font-bold text-slate-900 dark:text-white">₹{(viewInvoiceModal.previousBalance || 0).toFixed(2)}</span></p>
                    <p className="pt-1 border-t border-slate-200 dark:border-slate-700 font-extrabold font-sans text-slate-900 dark:text-white"><span className="text-slate-400">Net Ledger Balance:</span> ₹{subtotalUpToDate.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* 9-Column Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 text-[11px]">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="py-2 px-1.5 text-center border-r border-slate-800">S. No.</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-800">Qty.</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-800">Pack</th>
                      <th className="py-2 px-2 border-r border-slate-800">Product</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-800">Batch</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-800">Exp.</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-800">MRP</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-800">Rate</th>
                      <th className="py-2 px-2 text-center">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {viewInvoiceModal.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200 dark:border-slate-800">{idx + 1}</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200 dark:border-slate-800 font-bold">{item.qty}{item.freeQty ? `+${item.freeQty}` : ""}</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200 dark:border-slate-800 text-slate-400">{item.packSize || "10's"}</td>
                        <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">{item.productName}</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200 dark:border-slate-800 font-mono text-slate-500">{item.batchNumber}</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200 dark:border-slate-800 text-slate-500 whitespace-nowrap">{item.expiryDate}</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200 dark:border-slate-800">₹{item.mrp.toFixed(2)}</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200 dark:border-slate-800">₹{item.sellingRate.toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-center font-bold text-slate-900 dark:text-white">₹{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Amount in Words */}
              <div className="border-t border-b border-slate-200 dark:border-slate-800 py-1.5 px-2 font-bold text-[11px]">
                Amount in Words: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{numberToWords(viewInvoiceModal.grandTotal)}</span>
              </div>

              {/* Bottom Totals & Terms */}
              <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
                <div className="space-y-1 text-[10px] text-slate-500">
                  <p className="font-bold text-slate-700 dark:text-slate-300">Terms & Conditions:</p>
                  <p>1. Goods once sold will not be taken back.</p>
                  <p>2. Expiry may be intimated before 4 months.</p>
                  <p>3. Any claim regarding rate difference, bonus offer, breakage, leakage or difference in the bill should be intimated within 7 days of purchase along with the bill.</p>
                  <p>4. Subject to Anantnag jurisdiction entirely.</p>
                </div>
                <div className="space-y-1.5 text-right font-bold text-xs self-start pt-2">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                    <span className="text-slate-500">TOTAL:</span>
                    <span className="text-slate-900 dark:text-white">₹{viewInvoiceModal.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                    <span className="text-slate-500">LAST BALANCE:</span>
                    <span className="text-slate-900 dark:text-white">₹{(viewInvoiceModal.previousBalance || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">SUBTOTAL UP TO DATE:</span>
                    <span className="text-slate-900 dark:text-white">₹{subtotalUpToDate.toFixed(2)}</span>
                  </div>
                  {viewInvoiceModal.pendingBalance && viewInvoiceModal.pendingBalance > 0 && viewInvoiceModal.pendingBalance !== viewInvoiceModal.grandTotal && viewInvoiceModal.status !== "Paid" && (
                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400">
                      <span>PENDING BALANCE:</span>
                      <span>₹{viewInvoiceModal.pendingBalance.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Row */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                <span className="text-slate-400">Checked</span>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">For {businessProfile.name || "QADRI MEDICAL AGENCY"}</p>
                  <p className="text-slate-400 text-[10px] mt-4">Authorised Signatory & Stamp</p>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setViewInvoiceModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
              <button
                onClick={() => generateInvoicePDF(viewInvoiceModal, businessProfile, modalCustomer as Customer)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download A4 PDF Invoice</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
        );
      })()}

      {/* Cancel Invoice Modal */}
      {cancelModalInvoice &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <div className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-base text-rose-600 flex items-center space-x-2">
              <Ban className="w-5 h-5" />
              <span>Cancel Invoice {cancelModalInvoice.invoiceNumber}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cancelling this invoice will automatically restore medicine quantities back to stock and reverse customer ledger balance.
            </p>

            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (e.g. Order cancelled by party, error in items)..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setCancelModalInvoice(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  cancelInvoice(cancelModalInvoice.id, cancelReason || "User cancelled bill.");
                  setCancelModalInvoice(null);
                  setCancelReason("");
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Inline Add Customer Modal */}
      {showAddCustomerModal &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSaveInlineCustomer}
            className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                <UserPlus className="w-4 h-4 text-emerald-500" />
                <span>Register New Customer/Party</span>
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} type="button" className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Party / Chemist Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Care Chemists"
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+91 98200 00000"
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={newCustGst}
                  onChange={(e) => setNewCustGst(e.target.value)}
                  placeholder="27AAACQ1234F1Z5"
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Billing Address</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Shop #, Street, City"
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl"
              >
                Save & Select Customer
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Modal for Editing Cart Item Details in Billing */}
      {editingCartItem && editingCartItemIndex !== null &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Edit className="w-5 h-5 text-emerald-500" />
                <span>Edit Item Details for Invoice</span>
              </h3>
              <button
                onClick={() => {
                  setEditingCartItem(null);
                  setEditingCartItemIndex(null);
                }}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Product Name</label>
                <input
                  type="text"
                  value={editingCartItem.productName}
                  onChange={(e) => setEditingCartItem({ ...editingCartItem, productName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Batch Number</label>
                <input
                  type="text"
                  value={editingCartItem.batchNumber}
                  onChange={(e) => setEditingCartItem({ ...editingCartItem, batchNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Expiry Date</label>
                <input
                  type="date"
                  value={editingCartItem.expiryDate}
                  onChange={(e) => setEditingCartItem({ ...editingCartItem, expiryDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={editingCartItem.qty}
                  onChange={(e) => setEditingCartItem({ ...editingCartItem, qty: Number(e.target.value) || 1 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Free Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={editingCartItem.freeQty || 0}
                  onChange={(e) => setEditingCartItem({ ...editingCartItem, freeQty: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Selling Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingCartItem.sellingRate}
                  onChange={(e) => setEditingCartItem({ ...editingCartItem, sellingRate: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">MRP (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingCartItem.mrp}
                  onChange={(e) => setEditingCartItem({ ...editingCartItem, mrp: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingCartItem.discountPercent}
                  onChange={(e) => setEditingCartItem({ ...editingCartItem, discountPercent: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">GST %</label>
                <select
                  value={editingCartItem.gstPercent}
                  onChange={(e) => setEditingCartItem({ ...editingCartItem, gstPercent: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value={0}>0% GST</option>
                  <option value={5}>5% GST</option>
                  <option value={12}>12% GST</option>
                  <option value={18}>18% GST</option>
                  <option value={28}>28% GST</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-xs flex justify-between items-center font-bold">
              <span className="text-slate-500">Row Total Amount:</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-black">
                ₹{calculateRowAmount(editingCartItem).toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const masterProd = products.find((p) => p.id === editingCartItem.productId);
                  if (masterProd) {
                    setEditingMasterProduct({ ...masterProd });
                  } else {
                    alert("Master product not found in stock inventory.");
                  }
                }}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center space-x-1.5"
              >
                <Package className="w-3.5 h-3.5 text-emerald-500" />
                <span>Edit Stock Master Record</span>
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCartItem(null);
                    setEditingCartItemIndex(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updatedList = [...items];
                    const updatedItem = { ...editingCartItem, amount: calculateRowAmount(editingCartItem) };
                    updatedList[editingCartItemIndex] = updatedItem;
                    setItems(updatedList);
                    setEditingCartItem(null);
                    setEditingCartItemIndex(null);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal for Editing Master Product in Stock directly from Billing */}
      {editingMasterProduct &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProduct(editingMasterProduct);
              // Also update in cart items if present
              setItems((prev) =>
                prev.map((i) =>
                  i.productId === editingMasterProduct.id
                    ? {
                        ...i,
                        productName: editingMasterProduct.name,
                        batchNumber: editingMasterProduct.batchNumber,
                        expiryDate: editingMasterProduct.expiryDate,
                        mrp: editingMasterProduct.mrp,
                        sellingRate: editingMasterProduct.sellingRate,
                        gstPercent: editingMasterProduct.gstPercent,
                        amount: calculateRowAmount({
                          ...i,
                          productName: editingMasterProduct.name,
                          batchNumber: editingMasterProduct.batchNumber,
                          expiryDate: editingMasterProduct.expiryDate,
                          mrp: editingMasterProduct.mrp,
                          sellingRate: editingMasterProduct.sellingRate,
                          gstPercent: editingMasterProduct.gstPercent,
                        }),
                      }
                    : i
                )
              );
              setEditingMasterProduct(null);
            }}
            className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Package className="w-5 h-5 text-emerald-500" />
                <span>Edit Inventory Master Record ({editingMasterProduct.name})</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingMasterProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Product Brand Name *</label>
                <input
                  type="text"
                  required
                  value={editingMasterProduct.name}
                  onChange={(e) => setEditingMasterProduct({ ...editingMasterProduct, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Company / Manufacturer *</label>
                <input
                  type="text"
                  required
                  value={editingMasterProduct.companyName}
                  onChange={(e) => setEditingMasterProduct({ ...editingMasterProduct, companyName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Batch Number *</label>
                <input
                  type="text"
                  required
                  value={editingMasterProduct.batchNumber}
                  onChange={(e) => setEditingMasterProduct({ ...editingMasterProduct, batchNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={editingMasterProduct.expiryDate}
                  onChange={(e) => setEditingMasterProduct({ ...editingMasterProduct, expiryDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">MRP Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingMasterProduct.mrp}
                  onChange={(e) => setEditingMasterProduct({ ...editingMasterProduct, mrp: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Selling Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingMasterProduct.sellingRate}
                  onChange={(e) => setEditingMasterProduct({ ...editingMasterProduct, sellingRate: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">GST %</label>
                <select
                  value={editingMasterProduct.gstPercent}
                  onChange={(e) => setEditingMasterProduct({ ...editingMasterProduct, gstPercent: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value={0}>0% GST</option>
                  <option value={5}>5% GST</option>
                  <option value={12}>12% GST</option>
                  <option value={18}>18% GST</option>
                  <option value={28}>28% GST</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Current Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={editingMasterProduct.stockQuantity}
                  onChange={(e) => setEditingMasterProduct({ ...editingMasterProduct, stockQuantity: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingMasterProduct(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl"
              >
                Save Master Inventory Product
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
};
