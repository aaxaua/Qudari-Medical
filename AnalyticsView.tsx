import React from "react";
import { useApp } from "../../context/AppContext";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Sparkles,
  Bot,
  Zap,
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

export const AnalyticsView: React.FC = () => {
  const { products, customers, invoices, setAiDrawerOpen } = useApp();

  const salesTrendData = [
    { month: "Jan", sales: 145000, profit: 32000 },
    { month: "Feb", sales: 182000, profit: 41000 },
    { month: "Mar", sales: 210000, profit: 48000 },
    { month: "Apr", sales: 195000, profit: 43000 },
    { month: "May", sales: 240000, profit: 54000 },
    { month: "Jun", sales: 285000, profit: 65000 },
  ];

  const topSellingMedicines = products.slice(0, 5).map((p) => ({
    name: p.name.split(" ")[0],
    salesQty: Math.floor(200 + Math.random() * 800),
    revenue: Math.floor(5000 + Math.random() * 25000),
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            <span>Business Intelligence & Demand Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive revenue trends, fast-moving medicine analysis, profit margins & AI demand predictions.
          </p>
        </div>

        <button
          onClick={() => setAiDrawerOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-emerald-400 font-bold text-xs flex items-center space-x-2 border border-slate-700 shadow-md"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Ask AI For Sales Forecast</span>
        </button>
      </div>

      {/* AI Intelligence Insight Box */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-emerald-950 via-slate-900 to-slate-900 text-white border border-emerald-500/30 shadow-xl space-y-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-sm text-emerald-400">AI Inventory Reorder Intelligence</h3>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          Based on 30-day historical consumption velocity, <span className="font-bold text-emerald-300">Paracetamol 650mg</span> and <span className="font-bold text-emerald-300">Augmentin 625 Duo</span> are trending 28% higher in retail demand. Reorder 300 boxes from Cipla before Friday to prevent stockouts.
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales & Profit Area Chart */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Monthly Sales vs Net Profit</h3>
            <p className="text-xs text-slate-400">Revenue growth over 6 months</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Sales (₹)" />
                <Area type="monotone" dataKey="profit" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} name="Profit (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Fast Moving Medicines Bar Chart */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Fast Moving Medicines (By Volume)</h3>
            <p className="text-xs text-slate-400">Units sold in current month</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingMedicines}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="salesQty" fill="#10B981" radius={[6, 6, 0, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
