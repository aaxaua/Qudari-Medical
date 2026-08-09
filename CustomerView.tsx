import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../../context/AppContext";
import { Customer } from "../../types";
import { generatePaymentReceiptPDF, generateLedgerStatementPDF } from "../../lib/pdfGenerator";
import { PARTY_AVATAR_PRESETS, getPartyImage } from "../../lib/avatarPresets";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  FileText,
  DollarSign,
  CreditCard,
  Building,
  CheckCircle,
  AlertTriangle,
  Download,
  Share2,
  X,
  Edit,
  Trash2,
  BookOpen,
  Image as ImageIcon,
  Upload,
  MapPin,
  Check,
} from "lucide-react";

export const CustomerView: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    receiveCustomerPayment,
    invoices,
    ledgerEntries,
    businessProfile,
  } = useApp();

  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editModalCustomer, setEditModalCustomer] = useState<Customer | null>(null);
  const [paymentModalCustomer, setPaymentModalCustomer] = useState<Customer | null>(null);

  // Payment Form State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<"Cash" | "UPI" | "Bank Transfer" | "Cheque">("Cash");
  const [payRef, setPayRef] = useState<string>("");
  const [payNotes, setPayNotes] = useState<string>("");
  const [payDate, setPayDate] = useState<string>(() => new Date().toLocaleDateString("en-CA"));

  // New Customer Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    partyName: "",
    contactPerson: "",
    mobileNumber: "",
    whatsAppNumber: "",
    email: "",
    gstNumber: "",
    drugLicenseNumber: "",
    panNumber: "",
    billingAddress: "",
    city: "Anantnag",
    state: "Jammu & Kashmir",
    pinCode: "192101",
    creditLimit: 100000,
    openingBalance: 0,
    paymentTerms: "30 Days",
    businessCategory: "Retail Store",
    status: "Active",
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partyName || !formData.mobileNumber) {
      alert("Party name and mobile number are required.");
      return;
    }

    addCustomer({
      ...formData,
      currentBalance: formData.openingBalance || 0,
    } as any);

    setShowAddModal(false);
    setFormData({
      partyName: "",
      contactPerson: "",
      mobileNumber: "",
      whatsAppNumber: "",
      email: "",
      gstNumber: "",
      drugLicenseNumber: "",
      panNumber: "",
      billingAddress: "",
      city: "Anantnag",
      state: "Jammu & Kashmir",
      pinCode: "192101",
      creditLimit: 100000,
      openingBalance: 0,
      paymentTerms: "30 Days",
      businessCategory: "Retail Store",
      status: "Active",
    });
  };

  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editModalCustomer) {
      updateCustomer(editModalCustomer);
      setEditModalCustomer(null);
    }
  };

  const handleReceivePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentModalCustomer && payAmount > 0) {
      const paymentRecord = receiveCustomerPayment(
        paymentModalCustomer.id,
        payAmount,
        payMode,
        payRef || "REF-" + Date.now().toString().slice(-6),
        payNotes || "Collection received from party",
        payDate
      );

      // Generate Receipt PDF
      generatePaymentReceiptPDF(paymentRecord, businessProfile);

      setPaymentModalCustomer(null);
      setPayAmount(0);
      setPayRef("");
      setPayNotes("");
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase().trim();
    return (
      c.partyName.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.mobileNumber.includes(q) ||
      c.gstNumber.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  const totalOutstanding = customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const totalOverdueParties = customers.filter((c) => c.currentBalance > c.creditLimit).length;

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-500" />
            <span>Customer Parties & Ledger Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chemist party profiles, drug license tracking, payment collection receipts & WhatsApp reminders.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center space-x-2 transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Party</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Registered Parties</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{customers.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Pending Outstanding</p>
            <p className="text-xl font-black text-rose-500">₹{totalOutstanding.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Credit Limit Exceeded</p>
            <p className="text-xl font-black text-amber-500">{totalOverdueParties} Parties</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar & View Mode Toggle */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search party by name, code, phone, GSTIN, city..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
          />
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === "cards"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Party Cards</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === "table"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Table List</span>
          </button>
        </div>
      </div>

      {/* Main Party View */}
      {viewMode === "cards" ? (
        /* Professional Party Box Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No parties found</p>
              <p className="text-xs">Try searching with a different keyword or register a new party.</p>
            </div>
          ) : (
            filteredCustomers.map((c, idx) => {
              const partyImg = getPartyImage(c.profileImage, PARTY_AVATAR_PRESETS[idx % 6].id);

              return (
                <div
                  key={c.id}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition-all space-y-3 flex flex-col justify-between group"
                >
                  {/* Top Avatar Box Header */}
                  <div className="flex items-start space-x-3">
                    {/* Click photo to open full details */}
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500/30 group-hover:border-emerald-500 shrink-0 shadow-sm cursor-pointer transition-all hover:scale-105 bg-slate-900"
                      title="Click avatar to view complete party details"
                    >
                      <img
                        src={partyImg}
                        alt={c.partyName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {c.businessCategory || "Retail Store"}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {c.code}
                        </span>
                      </div>
                      <h3
                        onClick={() => setSelectedCustomer(c)}
                        className="font-bold text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:text-emerald-500 transition-colors pt-1"
                      >
                        {c.partyName}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">{c.contactPerson || "Contact Person"}</p>
                    </div>
                  </div>

                  {/* Financial Metrics Row */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Credit Limit</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        ₹{c.creditLimit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Net Balance</span>
                      <span
                        className={`font-black ${
                          c.currentBalance > 0 ? "text-rose-500" : "text-emerald-500"
                        }`}
                      >
                        ₹{c.currentBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info & Address Chips */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <p className="flex items-center space-x-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{c.mobileNumber}</span>
                    </p>
                    <p className="flex items-center space-x-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{c.billingAddress || `${c.city}, ${c.state}`}</span>
                    </p>
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 text-xs">
                    <button
                      onClick={() => setPaymentModalCustomer(c)}
                      className="flex-1 py-2 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] flex items-center justify-center space-x-1 shadow-xs transition-all"
                      title="Receive Payment Collection"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Receive</span>
                    </button>

                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-500 font-bold text-[11px] flex items-center space-x-1 transition-all"
                      title="View Complete Party Details"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => setEditModalCustomer(c)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-all"
                      title="Edit Party Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {c.currentBalance > 0 && (
                      <a
                        href={`https://wa.me/91${c.mobileNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hello ${c.partyName}, this is a payment reminder from Qadri Medical Agency. Your total pending balance is ₹${c.currentBalance.toFixed(
                            2
                          )}. Kindly arrange payment. Thank you!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all"
                        title="Send WhatsApp Payment Reminder"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Parties Table View */
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Party Name & Code</th>
                <th className="py-3 px-3">Contact & Phone</th>
                <th className="py-3 px-3">GSTIN & Drug License</th>
                <th className="py-3 px-3 text-right">Credit Limit (₹)</th>
                <th className="py-3 px-3 text-right">Outstanding (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                    <p className="font-bold text-slate-900 dark:text-white hover:text-emerald-500 transition-colors">{c.partyName}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">{c.code}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-slate-700 dark:text-slate-300">{c.contactPerson}</p>
                    <p className="text-[10px] text-slate-400">{c.mobileNumber}</p>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <p className="text-slate-700 dark:text-slate-300 font-bold">{c.gstNumber || "N/A"}</p>
                    <p className="text-[10px] text-slate-400">{c.drugLicenseNumber}</p>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-500">₹{c.creditLimit.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold">
                    <span className={c.currentBalance > 0 ? "text-rose-500 font-extrabold" : "text-emerald-500"}>
                      ₹{c.currentBalance.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => setPaymentModalCustomer(c)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px]"
                      >
                        Receive Payment
                      </button>
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500"
                        title="View Ledger Statement"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditModalCustomer(c)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-500"
                        title="Edit Customer Profile"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {c.currentBalance > 0 && (
                        <a
                          href={`https://wa.me/91${c.mobileNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Hello ${c.partyName}, this is a payment reminder from Qadri Medical Agency. Your total pending balance is ₹${c.currentBalance.toFixed(
                              2
                            )}. Kindly arrange payment. Thank you!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                          title="Send WhatsApp Reminder"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Detail & Full Ledger Modal */}
      {selectedCustomer &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <div className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                  <span>Customer Ledger: {selectedCustomer.partyName}</span>
                </h3>
                <p className="text-xs text-slate-400">Code: {selectedCustomer.code} | GSTIN: {selectedCustomer.gstNumber || "N/A"}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const custLedgers = ledgerEntries.filter((l) => l.customerId === selectedCustomer.id);
                    generateLedgerStatementPDF(selectedCustomer, custLedgers, businessProfile);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-emerald-400 font-bold text-xs flex items-center space-x-1 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Ledger PDF</span>
                </button>
                <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400">Phone:</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedCustomer.mobileNumber}</p>
              </div>
              <div>
                <span className="text-slate-400">Drug License:</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedCustomer.drugLicenseNumber || "N/A"}</p>
              </div>
              <div>
                <span className="text-slate-400">Credit Limit:</span>
                <p className="font-bold text-slate-900 dark:text-white">₹{selectedCustomer.creditLimit.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-slate-400">Current Outstanding:</span>
                <p className="font-black text-rose-500">₹{selectedCustomer.currentBalance.toFixed(2)}</p>
              </div>
            </div>

            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 pt-2">Full Account Ledger Transactions</h4>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Ref / Voucher</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                    <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                    <th className="py-2.5 px-3 text-right">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ledgerEntries
                    .filter((l) => l.customerId === selectedCustomer.id)
                    .map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">{entry.date}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{entry.reference}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{entry.description}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {entry.debit > 0 ? `₹${entry.debit.toFixed(2)}` : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-500">
                          {entry.credit > 0 ? `₹${entry.credit.toFixed(2)}` : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white">
                          ₹{entry.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Receive Payment Modal */}
      {paymentModalCustomer &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleReceivePaymentSubmit}
            className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>Receive Payment: {paymentModalCustomer.partyName}</span>
              </h3>
              <button onClick={() => setPaymentModalCustomer(null)} type="button" className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-400">Current Outstanding Balance:</span>
              <p className="text-lg font-black text-rose-500">₹{paymentModalCustomer.currentBalance.toFixed(2)}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full p-2.5 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Payment Amount Received (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value) || 0)}
                  className="w-full p-2.5 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Payment Method</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI Digital Payment</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other Mode</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Transaction Ref / Cheque #</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. UPI-99823100"
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentModalCustomer(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save & Print Receipt PDF</span>
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Edit Customer Profile Modal */}
      {editModalCustomer &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
            <form
              onSubmit={handleUpdateCustomer}
              className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Edit className="w-4 h-4 text-emerald-500" />
                  <span>Edit Party Profile: {editModalCustomer.partyName}</span>
                </h3>
                <button onClick={() => setEditModalCustomer(null)} type="button" className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar Selector & Gallery Upload */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Party Avatar / Shop Picture
                </label>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500 shrink-0 bg-slate-900">
                    <img
                      src={getPartyImage(editModalCustomer.profileImage)}
                      alt="Party Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2 items-center">
                    {PARTY_AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          setEditModalCustomer({ ...editModalCustomer, profileImage: preset.svgDataUri })
                        }
                        className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition-all ${
                          editModalCustomer.profileImage === preset.svgDataUri
                            ? "border-emerald-500 scale-110 shadow-md"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.svgDataUri} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <label className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-emerald-500 hover:text-slate-950 text-slate-700 dark:text-slate-200 text-[10px] font-bold cursor-pointer transition-all flex items-center space-x-1">
                      <Upload className="w-3 h-3" />
                      <span>Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setEditModalCustomer({
                                  ...editModalCustomer,
                                  profileImage: ev.target.result as string,
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Party / Store Name *</label>
                  <input
                    type="text"
                    required
                    value={editModalCustomer.partyName}
                    onChange={(e) => setEditModalCustomer({ ...editModalCustomer, partyName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                {/* Prominent Address Fields */}
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1 text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Party Complete Billing Address (Shown on Bills) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editModalCustomer.billingAddress || ""}
                    onChange={(e) => setEditModalCustomer({ ...editModalCustomer, billingAddress: e.target.value })}
                    placeholder="e.g. Main Market, Near Bus Stand, Shop No. 12"
                    className="w-full p-2.5 rounded-xl border border-emerald-500/40 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">City / Town</label>
                  <input
                    type="text"
                    value={editModalCustomer.city || ""}
                    onChange={(e) => setEditModalCustomer({ ...editModalCustomer, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">State & PIN Code</label>
                  <input
                    type="text"
                    value={editModalCustomer.state || ""}
                    onChange={(e) => setEditModalCustomer({ ...editModalCustomer, state: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editModalCustomer.contactPerson || ""}
                    onChange={(e) => setEditModalCustomer({ ...editModalCustomer, contactPerson: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={editModalCustomer.mobileNumber}
                    onChange={(e) => setEditModalCustomer({ ...editModalCustomer, mobileNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={editModalCustomer.gstNumber || ""}
                    onChange={(e) => setEditModalCustomer({ ...editModalCustomer, gstNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Drug License Number</label>
                  <input
                    type="text"
                    value={editModalCustomer.drugLicenseNumber || ""}
                    onChange={(e) => setEditModalCustomer({ ...editModalCustomer, drugLicenseNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={editModalCustomer.creditLimit}
                    onChange={(e) => setEditModalCustomer({ ...editModalCustomer, creditLimit: Number(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalCustomer(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}

      {/* Add New Customer Modal */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
            <form
              onSubmit={handleCreateCustomer}
              className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Building className="w-4 h-4 text-emerald-500" />
                  <span>Register New Chemist Party</span>
                </h3>
                <button onClick={() => setShowAddModal(false)} type="button" className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar Selector & Gallery Upload */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Party Picture / Avatar
                </label>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500 shrink-0 bg-slate-900">
                    <img
                      src={getPartyImage(formData.profileImage)}
                      alt="Selected Party Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2 items-center">
                    {PARTY_AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, profileImage: preset.svgDataUri })}
                        className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition-all ${
                          formData.profileImage === preset.svgDataUri
                            ? "border-emerald-500 scale-110 shadow-md"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.svgDataUri} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <label className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-emerald-500 hover:text-slate-950 text-slate-700 dark:text-slate-200 text-[10px] font-bold cursor-pointer transition-all flex items-center space-x-1">
                      <Upload className="w-3 h-3" />
                      <span>Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setFormData({ ...formData, profileImage: ev.target.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">Party / Store Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.partyName}
                    onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                    placeholder="e.g. Metro Medicals"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="+91 98200 12345"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                {/* Prominent Address Field */}
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1 text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Party Address (Automatically appears on Billing Invoices) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.billingAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, billingAddress: e.target.value, shippingAddress: e.target.value })
                    }
                    placeholder="e.g. Main Market, Near Civil Hospital, Shop No. 12"
                    className="w-full p-2.5 rounded-xl border border-emerald-500/40 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">City / Town</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Anantnag"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    placeholder="27AAACQ1234F1Z5"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Drug License Number</label>
                  <input
                    type="text"
                    value={formData.drugLicenseNumber}
                    onChange={(e) => setFormData({ ...formData, drugLicenseNumber: e.target.value })}
                    placeholder="20B-MH-123 / 21B-MH-123"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20"
                >
                  Register Party
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </div>
  );
};
