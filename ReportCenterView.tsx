import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  Package,
  Users,
  Receipt,
  Clock,
  TrendingUp,
  Building,
  CheckCircle,
} from "lucide-react";

export const ReportCenterView: React.FC = () => {
  const { products, customers, invoices, payments, businessProfile } = useApp();

  const [selectedReport, setSelectedReport] = useState<string>("SalesRegister");
  const [dateFilter, setDateFilter] = useState<string>("ThisMonth");

  const reports = [
    { id: "SalesRegister", title: "Sales Register Report", icon: Receipt, desc: "Detailed breakdown of all generated invoices & tax details" },
    { id: "LowStockReport", title: "Low Stock & Reorder Report", icon: Package, desc: "Medicines below minimum reorder thresholds" },
    { id: "ExpiryReport", title: "Expiry Management Report", icon: Clock, desc: "Medicines expiring within 30, 60, or 90 days" },
    { id: "CustomerOutstanding", title: "Party Ledger & Outstanding", icon: Users, desc: "Pending balances & party credit aging statement" },
    { id: "GSTSummary", title: "GST Tax Return Summary", icon: FileSpreadsheet, desc: "CGST, SGST, IGST tax breakdown for GST filings" },
    { id: "CashCollection", title: "Daily Cash & UPI Collection", icon: TrendingUp, desc: "Day-end collection register by payment mode" },
  ];

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (selectedReport === "SalesRegister") {
      csvContent += "Invoice Number,Date,Customer,Grand Total,Paid,Pending,Status\n";
      invoices.forEach((i) => {
        csvContent += `"${i.invoiceNumber}","${i.date}","${i.customerName}",${i.grandTotal},${i.paidAmount},${i.pendingBalance},"${i.status}"\n`;
      });
    } else if (selectedReport === "LowStockReport") {
      csvContent += "Product Name,Company,Batch,Current Stock,Min Stock Level,Selling Rate\n";
      products
        .filter((p) => p.stockQuantity <= p.minStockLevel)
        .forEach((p) => {
          csvContent += `"${p.name}","${p.companyName}","${p.batchNumber}",${p.stockQuantity},${p.minStockLevel},${p.sellingRate}\n`;
        });
    } else if (selectedReport === "CustomerOutstanding") {
      csvContent += "Party Name,Code,Phone,GSTIN,Credit Limit,Current Balance\n";
      customers.forEach((c) => {
        csvContent += `"${c.partyName}","${c.code}","${c.mobileNumber}","${c.gstNumber}",${c.creditLimit},${c.currentBalance}\n`;
      });
    } else {
      csvContent += "Product Name,Batch,Expiry Date,Stock,MRP,Selling Rate\n";
      products.forEach((p) => {
        csvContent += `"${p.name}","${p.batchNumber}","${p.expiryDate}",${p.stockQuantity},${p.mrp},${p.sellingRate}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedReport}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
            <span>Enterprise Report Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate, audit, and export GST tax registers, party ledgers, and stock valuation reports.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center space-x-2 transition-all shadow-md shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Report CSV</span>
          </button>
        </div>
      </div>

      {/* Reports Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;
          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`p-4 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-300 shadow-md"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-2xl ${isSelected ? "bg-emerald-500 text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && <CheckCircle className="w-5 h-5 text-emerald-500" />}
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{rep.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{rep.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Preview Table */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Report Preview: {reports.find((r) => r.id === selectedReport)?.title}</span>
          </h3>
          <span className="text-xs text-slate-400">Total Records: {invoices.length}</span>
        </div>

        <div className="overflow-x-auto">
          {selectedReport === "SalesRegister" && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer Party</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">GST Tax</th>
                  <th className="py-2.5 px-3 text-right">Grand Total</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-3 text-slate-400">{inv.date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{inv.customerName}</td>
                    <td className="py-2.5 px-3 text-right">₹{inv.subtotal.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-500">₹{inv.gstAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold">₹{inv.grandTotal.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === "LowStockReport" && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                  <th className="py-2.5 px-3">Medicine</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3 text-center">Current Stock</th>
                  <th className="py-2.5 px-3 text-center">Min Reorder Level</th>
                  <th className="py-2.5 px-3 text-right">Selling Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products
                  .filter((p) => p.stockQuantity <= p.minStockLevel)
                  .map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{p.companyName}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-500">{p.batchNumber}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-500">{p.stockQuantity} {p.unit}s</td>
                      <td className="py-2.5 px-3 text-center">{p.minStockLevel} {p.unit}s</td>
                      <td className="py-2.5 px-3 text-right font-bold">₹{p.sellingRate.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {selectedReport !== "SalesRegister" && selectedReport !== "LowStockReport" && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                  <th className="py-2.5 px-3">Party Name</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">GSTIN</th>
                  <th className="py-2.5 px-3 text-right">Credit Limit</th>
                  <th className="py-2.5 px-3 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{c.partyName}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-500">{c.code}</td>
                    <td className="py-2.5 px-3 text-slate-400">{c.mobileNumber}</td>
                    <td className="py-2.5 px-3 text-slate-400">{c.gstNumber || "N/A"}</td>
                    <td className="py-2.5 px-3 text-right font-bold">₹{c.creditLimit.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-rose-500">₹{c.currentBalance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
