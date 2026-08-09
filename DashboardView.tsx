import React from "react";
import { useApp } from "../../context/AppContext";
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Package,
  AlertTriangle,
  Clock,
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  BarChart3,
  Bot,
  Sparkles,
  CreditCard,
  Building,
  CheckCircle,
  Pill,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const DashboardView: React.FC = () => {
  const {
    products,
    customers,
    invoices,
    payments,
    activityLogs,
    setActiveTab,
    setAiDrawerOpen,
  } = useApp();

  const todayStr = new Date().toISOString().split("T")[0];

  const todayInvoices = invoices.filter((i) => i.date === todayStr && i.status !== "Cancelled");
  const todaySales = todayInvoices.reduce((sum, i) => sum + i.grandTotal, 0);

  const totalRevenue = invoices
    .filter((i) => i.status !== "Cancelled")
    .reduce((sum, i) => sum + i.grandTotal, 0);

  // Profit calculation = sum of (sellingRate - purchaseRate) * qty
  const totalProfit = invoices
    .filter((i) => i.status !== "Cancelled")
    .reduce((sum, i) => {
      const invProfit = i.items.reduce((pSum, item) => {
        const prod = products.find((pr) => pr.id === item.productId);
        const buyRate = prod ? prod.purchaseRate : item.sellingRate * 0.75;
        return pSum + (item.sellingRate - buyRate) * item.qty;
      }, 0);
      return sum + invProfit;
    }, 0);

  const totalOutstanding = customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const inventoryValue = products.reduce((sum, p) => sum + p.stockQuantity * p.purchaseRate, 0);

  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStockLevel);
  const expiringProducts = products.filter((p) => p.status === "Expiring Soon" || p.status === "Expired");

  // Chart data
  const salesByDay = [
    { day: "Mon", sales: 18500, profit: 4200 },
    { day: "Tue", sales: 24200, profit: 5800 },
    { day: "Wed", sales: 19800, profit: 4100 },
    { day: "Thu", sales: 31000, profit: 7900 },
    { day: "Fri", sales: 28900, profit: 6400 },
    { day: "Sat", sales: 38400, profit: 9200 },
    { day: "Sun", sales: todaySales || 15200, profit: (todaySales || 15200) * 0.22 },
  ];

  const categoryDistribution = [
    { name: "Tablets", value: products.filter((p) => p.category === "Tablet").length },
    { name: "Capsules", value: products.filter((p) => p.category === "Capsule").length },
    { name: "Syrups", value: products.filter((p) => p.category === "Syrup").length },
    { name: "Injections", value: products.filter((p) => p.category === "Injection").length },
    { name: "Devices", value: products.filter((p) => p.category === "Medical Device" || p.category === "Medical Equipment").length },
  ];

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6 animate-fadeIn">
      {/* Quick Hero Banner */}
      <div className="p-5 md:p-6 rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              Live ERP Dashboard
            </span>
            <span className="text-xs text-slate-400">Updated Real-Time</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Qadri Medical Agency Management System
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Real-time control center for inventory, billing, party ledgers, sales analytics, and AI automation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={() => setActiveTab("Billing")}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
          <button
            onClick={() => setAiDrawerOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-bold text-xs flex items-center space-x-2 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Today's Sales */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today's Sales</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            ₹{todaySales.toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center space-x-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>{todayInvoices.length} Bills Today</span>
          </p>
        </div>

        {/* Total Revenue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Revenue</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            ₹{totalRevenue.toFixed(2)}
          </p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
            Overall Sales Executed
          </p>
        </div>

        {/* Gross Profit */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Gross Profit</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            ₹{totalProfit.toFixed(2)}
          </p>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            ~22% Average Margin
          </p>
        </div>

        {/* Customer Outstanding */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Party Outstanding</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-black text-rose-600 dark:text-rose-400">
            ₹{totalOutstanding.toFixed(2)}
          </p>
          <p className="text-[11px] text-rose-500 font-semibold mt-1">
            Pending Collection
          </p>
        </div>
      </div>

      {/* Secondary Quick Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab("Inventory")}
          className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center space-x-3 cursor-pointer hover:bg-amber-500/20 transition-all"
        >
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-extrabold text-base leading-none">{lowStockProducts.length}</p>
            <p className="text-[11px] font-medium">Low Stock Medicines</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("Inventory")}
          className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center space-x-3 cursor-pointer hover:bg-rose-500/20 transition-all"
        >
          <Clock className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-extrabold text-base leading-none">{expiringProducts.length}</p>
            <p className="text-[11px] font-medium">Expiring / Expired</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("Inventory")}
          className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center space-x-3 cursor-pointer hover:bg-emerald-500/20 transition-all"
        >
          <Package className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-extrabold text-base leading-none">₹{inventoryValue.toFixed(0)}</p>
            <p className="text-[11px] font-medium">Inventory Valuation</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("Customers")}
          className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center space-x-3 cursor-pointer hover:bg-blue-500/20 transition-all"
        >
          <Building className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-extrabold text-base leading-none">{customers.length}</p>
            <p className="text-[11px] font-medium">Active Retail Parties</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Weekly Sales & Profit Trend</h3>
              <p className="text-xs text-slate-400">Daily revenue compared to profit margin</p>
            </div>
            <button
              onClick={() => setActiveTab("Analytics")}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Full Analytics →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByDay}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff" }}
                  formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, "Amount"]}
                />
                <Bar dataKey="sales" fill="#10B981" radius={[6, 6, 0, 0]} name="Sales" />
                <Bar dataKey="profit" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Inventory By Category</h3>
            <p className="text-xs text-slate-400">Product volume breakdown</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {categoryDistribution.map((item, idx) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></span>
                <span className="text-slate-600 dark:text-slate-300 truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Invoices & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-emerald-500" />
              <span>Recent Invoices</span>
            </h3>
            <button
              onClick={() => setActiveTab("Billing")}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View All Invoices →
            </button>
          </div>

          <div className="space-y-2">
            {invoices.slice(0, 4).map((inv) => (
              <div
                key={inv.id}
                onClick={() => setActiveTab("Billing")}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-slate-100 dark:border-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">{inv.invoiceNumber}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{inv.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs text-slate-900 dark:text-white">₹{inv.grandTotal.toFixed(2)}</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status === "Paid"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : inv.status === "Pending"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>System Activity Audit Feed</span>
            </h3>
            <span className="text-xs text-slate-400">Live Audit Log</span>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{log.details}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>By: {log.user}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">{log.module}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
