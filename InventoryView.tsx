import React, { useState } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import { useApp } from "../../context/AppContext";
import { Product, ProductCategory, ProductStatus } from "../../types";
import { PRODUCT_CATEGORY_PRESETS, getProductImage } from "../../lib/avatarPresets";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  Sparkles,
  Upload,
  Download,
  Barcode,
  Layers,
  LayoutGrid,
  List,
  X,
  Pill,
  CheckCircle,
  FileSpreadsheet,
  PackagePlus,
  Image as ImageIcon,
} from "lucide-react";

export const InventoryView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    bulkImportProducts,
  } = useApp();

  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [activeTab, setActiveTab] = useState<"All" | "LowStock" | "Expiry">("All");

  // Filters
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editProductModal, setEditProductModal] = useState<Product | null>(null);
  const [adjustStockModal, setAdjustStockModal] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<"ADD" | "REMOVE" | "ADJUST">("ADD");
  const [adjustReason, setAdjustReason] = useState<string>("");

  const [showBulkImportModal, setShowBulkImportModal] = useState<boolean>(false);
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const handleQuickAddProduct = (prod: Product) => {
    adjustStock(prod.id, 1, "ADD", "Quick add from product card");
    setAddedToast(`Added 1 unit to ${prod.name} (Stock: ${prod.stockQuantity + 1})`);
    setTimeout(() => {
      setAddedToast((current) => (current && current.includes(prod.name) ? null : current));
    }, 2500);
  };

  // New Product Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    genericName: "",
    brandName: "",
    companyName: "",
    category: "Tablet",
    productType: "Tablet",
    packSize: "10 Strips",
    strength: "500mg",
    unit: "Strip",
    hsnCode: "3004",
    gstPercent: 12,
    mrp: 100,
    purchaseRate: 60,
    sellingRate: 80,
    discountPercent: 5,
    barcode: "890" + Math.floor(100000000 + Math.random() * 900000000),
    batchNumber: "B2026-" + Math.floor(100 + Math.random() * 900),
    mfdDate: "2026-01-01",
    expiryDate: "2028-12-31",
    stockQuantity: 100,
    minStockLevel: 20,
    maxStockLevel: 500,
    rackNumber: "A-1",
    shelfNumber: "S-1",
    supplier: "Standard Pharma Supply",
    description: "High demand pharmaceutical product.",
    status: "In Stock",
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.batchNumber) {
      alert("Product name and batch number are required.");
      return;
    }

    const res = addProduct(formData as any);
    if (res.success) {
      setShowAddModal(false);
      setFormData({
        name: "",
        genericName: "",
        brandName: "",
        companyName: "",
        category: "Tablet",
        productType: "Tablet",
        packSize: "10 Strips",
        strength: "500mg",
        unit: "Strip",
        hsnCode: "3004",
        gstPercent: 12,
        mrp: 100,
        purchaseRate: 60,
        sellingRate: 80,
        discountPercent: 5,
        barcode: "890" + Math.floor(100000000 + Math.random() * 900000000),
        batchNumber: "B2026-" + Math.floor(100 + Math.random() * 900),
        mfdDate: "2026-01-01",
        expiryDate: "2028-12-31",
        stockQuantity: 100,
        minStockLevel: 20,
        maxStockLevel: 500,
        rackNumber: "A-1",
        shelfNumber: "S-1",
        supplier: "Standard Pharma Supply",
        description: "",
        status: "In Stock",
      });
    } else {
      alert(res.message);
    }
  };

  const handleUpdateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editProductModal) {
      updateProduct(editProductModal);
      setEditProductModal(null);
    }
  };

  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustStockModal) {
      adjustStock(adjustStockModal.id, adjustQty, adjustType, adjustReason || "Manual inventory adjustment");
      setAdjustStockModal(null);
      setAdjustQty(0);
      setAdjustReason("");
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.genericName.toLowerCase().includes(q) ||
      p.companyName.toLowerCase().includes(q) ||
      p.batchNumber.toLowerCase().includes(q) ||
      p.barcode.includes(q);

    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;

    if (activeTab === "LowStock") {
      return matchesSearch && (p.status === "Low Stock" || p.status === "Out of Stock");
    } else if (activeTab === "Expiry") {
      return matchesSearch && (p.status === "Expiring Soon" || p.status === "Expired");
    }

    return matchesSearch && matchesCat && matchesStatus;
  });

  // Calculate profit margin %
  const calcProfitMargin = (sell: number, buy: number) => {
    if (buy <= 0) return 0;
    return (((sell - buy) / buy) * 100).toFixed(1);
  };

  // Category soft badge styles helper
  const getCategoryBadgeStyle = (category: string) => {
    switch (category?.toLowerCase()) {
      case "tablet":
      case "tablets":
        return "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
      case "capsule":
      case "capsules":
        return "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800";
      case "syrup":
      case "syrups":
      case "suspension":
        return "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
      case "injection":
      case "injections":
        return "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
      case "cream/lotion":
      case "cream":
      case "ointment":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
      case "medical device":
      case "medical equipment":
        return "bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800";
      case "drops":
      case "eye drops":
        return "bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  // Summary Metrics calculations
  const totalStockCount = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalStockValuation = products.reduce((acc, p) => acc + p.stockQuantity * p.sellingRate, 0);
  const lowStockProductsCount = products.filter((p) => p.status === "Low Stock" || p.status === "Out of Stock").length;
  const expiringProductsCount = products.filter((p) => p.status === "Expiring Soon" || p.status === "Expired").length;
  const inStockProductsCount = products.filter((p) => p.status === "In Stock").length;

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6 animate-fadeIn">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Package className="w-6 h-6 text-emerald-500" />
            <span>Pharmaceutical Inventory & Stock</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time medicine database, batch tracking, category badges, expiry monitoring & AI importer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center space-x-2 transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-all"
          >
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>Bulk Import</span>
          </button>
        </div>
      </div>

      {/* Responsive Top Statistics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Products Card */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              Total Medicines
            </p>
            <p className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {products.length}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {totalStockCount.toLocaleString()} units in stock
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Healthy In-Stock Card */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              Healthy Stock
            </p>
            <p className="text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {inStockProductsCount}
            </p>
            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium truncate">
              Adequate inventory
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock Alerts Card */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              Low Stock Alerts
            </p>
            <p className="text-lg sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {lowStockProductsCount}
            </p>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium truncate">
              Needs reorder
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Stock Valuation Card */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              Total Stock Value
            </p>
            <p className="text-lg sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 truncate">
              ₹{totalStockValuation.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              Estimated selling value
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation SubTabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("All")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "All"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            All Medicines ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("LowStock")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "LowStock"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock ({products.filter((p) => p.status === "Low Stock" || p.status === "Out of Stock").length})</span>
          </button>
          <button
            onClick={() => setActiveTab("Expiry")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "Expiry"
                ? "bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Expiring / Expired ({products.filter((p) => p.status === "Expiring Soon" || p.status === "Expired").length})</span>
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-xl text-xs transition-all ${
              viewMode === "table" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-400"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-xl text-xs transition-all ${
              viewMode === "grid" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-400"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand, generic name, batch, barcode..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto min-w-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-44 h-9 px-3 pr-7 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white truncate min-w-0 box-border cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Categories</option>
            <option value="Tablet">Tablets</option>
            <option value="Capsule">Capsules</option>
            <option value="Syrup">Syrups</option>
            <option value="Injection">Injections</option>
            <option value="Cream/Lotion">Creams & Lotions</option>
            <option value="Medical Device">Medical Devices</option>
            <option value="Medical Equipment">Medical Equipment</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-44 h-9 px-3 pr-7 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white truncate min-w-0 box-border cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Main Table or Card View */}
      {viewMode === "table" ? (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Company</th>
                <th className="py-3 px-3">Batch & Exp</th>
                <th className="py-3 px-3 text-right">MRP (₹)</th>
                <th className="py-3 px-3 text-right">Selling (₹)</th>
                <th className="py-3 px-3 text-center">Margin %</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.genericName} | Pack: {p.packSize}</p>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">{p.companyName}</td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{p.batchNumber}</span>
                    <span className="text-slate-400 block text-[10px]">Exp: {p.expiryDate}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-500">₹{p.mrp.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">₹{p.sellingRate.toFixed(2)}</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    +{calcProfitMargin(p.sellingRate, p.purchaseRate)}%
                  </td>
                  <td className="py-3 px-3 text-center font-extrabold text-slate-900 dark:text-white">
                    {p.stockQuantity} <span className="text-[10px] font-normal text-slate-400">{p.unit}s</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === "In Stock"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : p.status === "Low Stock"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          : p.status === "Expired"
                          ? "bg-rose-200 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => {
                          setAdjustStockModal(p);
                          setAdjustQty(p.stockQuantity);
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]"
                        title="Adjust Stock"
                      >
                        Adjust
                      </button>
                      <button
                        onClick={() => setBarcodeModalProduct(p)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500"
                        title="View Barcode"
                      >
                        <Barcode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditProductModal({ ...p })}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 font-bold"
                        title="Edit Product Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmProduct(p)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Modern Compact Product Card Grid */
        filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <Pill className="w-10 h-10 text-emerald-500/40 mx-auto" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No matching products found</p>
            <p className="text-xs">Try adjusting your search query or select a different category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Product Image / Category Preset */}
                <div className="relative aspect-4/3 w-full bg-slate-950/90 dark:bg-slate-900 flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={getProductImage(p.category, p.imageUrl)}
                    alt={p.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Category Badge on Bottom Left */}
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight bg-slate-900/80 text-emerald-400 backdrop-blur-xs border border-emerald-500/20">
                    {p.category || "Tablet"}
                  </span>

                  {/* Stock Quantity Badge */}
                  <span
                    className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-tight shadow-xs ${
                      p.stockQuantity <= 0
                        ? "bg-rose-500 text-white"
                        : p.stockQuantity < p.minStockLevel
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-900/80 dark:bg-slate-100/90 text-white dark:text-slate-900 backdrop-blur-xs"
                    }`}
                  >
                    {p.stockQuantity} {p.unit || "pcs"}
                  </span>
                </div>

                {/* Product Info */}
                <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1.5">
                  <div>
                    <h3
                      className="font-bold text-xs text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                      title={p.name}
                    >
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      MRP ₹{p.mrp.toFixed(2)}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
                    <div className="flex items-center space-x-0.5 sm:space-x-1">
                      <button
                        onClick={() => setDeleteConfirmProduct(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditProductModal({ ...p })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setAdjustStockModal(p);
                          setAdjustType("ADD");
                          setAdjustQty(10);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        title="Restock Item"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleQuickAddProduct(p)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs flex items-center space-x-1 transition-all shadow-xs shadow-emerald-500/20"
                      title="Quick Add 1 Unit"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Add Product Modal */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleCreateProduct}
            className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Package className="w-5 h-5 text-emerald-500" />
                <span>Add New Pharmaceutical Product</span>
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Image & Category Preset Selector */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Product Image / Category Icon
              </label>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500 shrink-0 bg-slate-900 flex items-center justify-center p-1">
                  <img
                    src={getProductImage(formData.category, formData.imageUrl)}
                    alt="Product Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 flex flex-wrap gap-2 items-center">
                  <label className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-600 font-bold text-[11px] cursor-pointer transition-all flex items-center space-x-1 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image from Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setFormData({ ...formData, imageUrl: ev.target.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="px-2 py-1 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-bold"
                    >
                      Reset Image
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Product Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Paracetamol 650mg"
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Company / Manufacturer *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Cipla Ltd"
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Generic Composition</label>
                <input
                  type="text"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  placeholder="e.g. Paracetamol IP 650mg"
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Cream/Lotion">Cream/Lotion</option>
                  <option value="Medical Device">Medical Device</option>
                  <option value="Medical Equipment">Medical Equipment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Batch Number *</label>
                <input
                  type="text"
                  required
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">MRP Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) || 0 })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Purchase Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchaseRate}
                  onChange={(e) => setFormData({ ...formData, purchaseRate: Number(e.target.value) || 0 })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Selling Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sellingRate}
                  onChange={(e) => setFormData({ ...formData, sellingRate: Number(e.target.value) || 0 })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) || 0 })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Edit Product Modal */}
      {editProductModal &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <form
            onSubmit={handleUpdateProductSubmit}
            className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Edit className="w-5 h-5 text-emerald-500" />
                <span>Edit Product Details ({editProductModal.name})</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditProductModal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Product Brand Name *</label>
                <input
                  type="text"
                  required
                  value={editProductModal.name}
                  onChange={(e) => setEditProductModal({ ...editProductModal, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Company / Manufacturer *</label>
                <input
                  type="text"
                  required
                  value={editProductModal.companyName}
                  onChange={(e) => setEditProductModal({ ...editProductModal, companyName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Generic Composition</label>
                <input
                  type="text"
                  value={editProductModal.genericName || ""}
                  onChange={(e) => setEditProductModal({ ...editProductModal, genericName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={editProductModal.category}
                  onChange={(e) => setEditProductModal({ ...editProductModal, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Cream/Lotion">Cream/Lotion</option>
                  <option value="Medical Device">Medical Device</option>
                  <option value="Medical Equipment">Medical Equipment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Batch Number *</label>
                <input
                  type="text"
                  required
                  value={editProductModal.batchNumber}
                  onChange={(e) => setEditProductModal({ ...editProductModal, batchNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={editProductModal.expiryDate}
                  onChange={(e) => setEditProductModal({ ...editProductModal, expiryDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">MRP Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editProductModal.mrp}
                  onChange={(e) => setEditProductModal({ ...editProductModal, mrp: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Purchase Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editProductModal.purchaseRate}
                  onChange={(e) => setEditProductModal({ ...editProductModal, purchaseRate: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Selling Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editProductModal.sellingRate}
                  onChange={(e) => setEditProductModal({ ...editProductModal, sellingRate: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">GST %</label>
                <select
                  value={editProductModal.gstPercent}
                  onChange={(e) => setEditProductModal({ ...editProductModal, gstPercent: Number(e.target.value) || 0 })}
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
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={editProductModal.stockQuantity}
                  onChange={(e) => setEditProductModal({ ...editProductModal, stockQuantity: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Stock Unit</label>
                <input
                  type="text"
                  value={editProductModal.unit || "Strip"}
                  onChange={(e) => setEditProductModal({ ...editProductModal, unit: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Pack Size</label>
                <input
                  type="text"
                  value={editProductModal.packSize || "10 Strips"}
                  onChange={(e) => setEditProductModal({ ...editProductModal, packSize: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Barcode Number</label>
                <input
                  type="text"
                  value={editProductModal.barcode || ""}
                  onChange={(e) => setEditProductModal({ ...editProductModal, barcode: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">HSN Code</label>
                <input
                  type="text"
                  value={editProductModal.hsnCode || "3004"}
                  onChange={(e) => setEditProductModal({ ...editProductModal, hsnCode: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Rack Number</label>
                <input
                  type="text"
                  value={editProductModal.rackNumber || "A-1"}
                  onChange={(e) => setEditProductModal({ ...editProductModal, rackNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Shelf Number</label>
                <input
                  type="text"
                  value={editProductModal.shelfNumber || "S-1"}
                  onChange={(e) => setEditProductModal({ ...editProductModal, shelfNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Min Alert Stock</label>
                <input
                  type="number"
                  value={editProductModal.minStockLevel || 10}
                  onChange={(e) => setEditProductModal({ ...editProductModal, minStockLevel: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditProductModal(null)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
              >
                Save Updated Product
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Adjust Stock Modal */}
      {adjustStockModal &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleAdjustStockSubmit}
            className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4"
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Stock Adjustment: {adjustStockModal.name}
            </h3>
            <p className="text-xs text-slate-400">Current Stock: {adjustStockModal.stockQuantity} {adjustStockModal.unit}s</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Adjustment Action</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="ADD">Add New Received Stock</option>
                  <option value="REMOVE">Remove Damaged/Returned Stock</option>
                  <option value="ADJUST">Set Exact Physical Stock Quantity</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Quantity</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Reason / Reference Remarks</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received new shipment from distributor"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustStockModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl"
              >
                Update Stock Quantity
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Barcode Display Modal */}
      {barcodeModalProduct &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <div className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Product Barcode</span>
              <button onClick={() => setBarcodeModalProduct(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2 text-slate-900">
              <p className="font-extrabold text-sm">{barcodeModalProduct.name}</p>
              <p className="text-xs text-slate-500">{barcodeModalProduct.companyName} | Batch: {barcodeModalProduct.batchNumber}</p>
              {/* Simulated crisp barcode graphic */}
              <div className="py-4 px-2 flex justify-center space-x-1 items-end h-16 bg-slate-50 rounded-xl border">
                {[3, 1, 4, 1, 5, 2, 1, 3, 4, 1, 2, 5, 2, 1, 3, 2, 4, 1, 3].map((w, i) => (
                  <div key={i} className="bg-slate-900 h-full" style={{ width: `${w * 2}px` }}></div>
                ))}
              </div>
              <p className="font-mono font-bold text-sm tracking-widest">{barcodeModalProduct.barcode}</p>
            </div>

            <button
              onClick={() => {
                alert("Barcode sent to connected thermal printer!");
                setBarcodeModalProduct(null);
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2"
            >
              <Barcode className="w-4 h-4" />
              <span>Print Barcode Label</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportDialog
          onClose={() => setShowBulkImportModal(false)}
          onImport={(itemsToImport) => {
            const res = bulkImportProducts(itemsToImport);
            alert(`Imported ${res.imported} products successfully! (${res.skipped} skipped/duplicates)`);
            setShowBulkImportModal(false);
          }}
          existingProducts={products}
        />
      )}

      {/* Delete Product Confirmation Modal */}
      {deleteConfirmProduct &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
            <div className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-5 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete this product?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-bold text-slate-900 dark:text-white">{deleteConfirmProduct.name}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteProduct(deleteConfirmProduct.id);
                    const deletedName = deleteConfirmProduct.name;
                    setDeleteConfirmProduct(null);
                    setAddedToast(`Product "${deletedName}" deleted permanently.`);
                    setTimeout(() => {
                      setAddedToast((curr) => (curr && curr.includes(deletedName) ? null : curr));
                    }, 3000);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors shadow-md shadow-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Action Toast Feedback Banner */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold border border-emerald-500/30">
          <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-slate-950 shrink-0" />
          <span>{addedToast}</span>
        </div>
      )}
    </div>
  );
};

// Intelligent Bulk Import Dialog Component - Text, File (.xlsx/.csv/.pdf) & Image OCR
interface BulkImportDialogProps {
  onClose: () => void;
  onImport: (items: Partial<Product>[]) => void;
  existingProducts: Product[];
}

const BulkImportDialog: React.FC<BulkImportDialogProps> = ({ onClose, onImport, existingProducts }) => {
  const [importMode, setImportMode] = useState<"text" | "file" | "image">("text");
  const [rawText, setRawText] = useState<string>(
    "Paracetamol 650mg, Batch: B2026-99, Exp: 2028-12-31, MRP: 40, Rate: 28, Qty: 150, GST: 12%\nAugmentin 625 Duo, Batch: B2026-101, Exp: 2027-10-31, MRP: 210, Rate: 165, Qty: 80, GST: 12%\nCefixime 200mg, MRP: 110"
  );
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [step, setStep] = useState<"input" | "preview">("input");
  const [isExtractingImage, setIsExtractingImage] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  // Process raw objects into structured validation items
  const processParsedDataArray = (itemsArray: any[]) => {
    const results: any[] = [];
    itemsArray.forEach((item, idx) => {
      const name = item.name || item.ProductName || item.Item || item["Product Name"] || `Medicine ${idx + 1}`;
      const batch = item.batchNumber || item.Batch || item.batch || item["Batch No"] || item["B.No"] || "";
      const exp = item.expiryDate || item.Expiry || item.exp || item["Exp Date"] || item["EXP"] || "";
      const mrp = Number(item.mrp || item.MRP || item["M.R.P"]) || 100;
      const rate = Number(item.sellingRate || item.Rate || item.rate || item["Selling Rate"] || item.Price) || Math.round(mrp * 0.8);
      const qty = Number(item.stockQuantity || item.Qty || item.qty || item.Stock || item.Quantity) || 50;
      const gst = Number(item.gstPercent || item.GST || item["GST %"]) || 12;

      let status: "Ready" | "Needs Batch" | "Duplicate" = "Ready";
      let statusMsg = "Ready for import";

      const isDuplicate = existingProducts.some(
        (p) => p.name.toLowerCase() === name.toLowerCase() && batch && p.batchNumber.toLowerCase() === batch.toLowerCase()
      );

      if (isDuplicate) {
        status = "Duplicate";
        statusMsg = "Already exists in catalog";
      } else if (!batch || !exp) {
        status = "Needs Batch";
        statusMsg = "Batch or expiry missing (Fill inline before import)";
      }

      results.push({
        id: "import_" + idx + "_" + Date.now(),
        name,
        batchNumber: batch,
        expiryDate: exp,
        mrp,
        sellingRate: rate,
        purchaseRate: Math.round(rate * 0.8),
        stockQuantity: qty,
        gstPercent: gst,
        companyName: item.company || item.companyName || "Cipla / Standard",
        category: item.category || "Tablet",
        packSize: item.packSize || "10's",
        status,
        statusMsg,
      });
    });

    setParsedItems(results);
    setStep("preview");
  };

  const parseRawText = () => {
    const lines = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    const rawObjects: any[] = [];

    lines.forEach((line) => {
      const nameMatch = line.match(/^([^,:\d]+(?:\d+mg)?)/i);
      const name = nameMatch ? nameMatch[1].trim() : line;

      const mrpMatch = line.match(/mrp[:\s]*₹?\s*(\d+(?:\.\d+)?)/i);
      const rateMatch = line.match(/(?:rate|price|selling)[:\s]*₹?\s*(\d+(?:\.\d+)?)/i);
      const qtyMatch = line.match(/(?:qty|quantity|stock)[:\s]*(\d+)/i);
      const batchMatch = line.match(/(?:batch|b\.no|bno)[:\s]*([a-zA-Z0-9\-_]+)/i);
      const expMatch = line.match(/(?:exp|expiry)[:\s]*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{4}|\d{2}-\d{4})/i);
      const gstMatch = line.match(/(?:gst|tax)[:\s]*(\d+)/i);

      rawObjects.push({
        name,
        batchNumber: batchMatch ? batchMatch[1] : "",
        expiryDate: expMatch ? expMatch[1] : "",
        mrp: mrpMatch ? parseFloat(mrpMatch[1]) : 100,
        sellingRate: rateMatch ? parseFloat(rateMatch[1]) : 80,
        stockQuantity: qtyMatch ? parseInt(qtyMatch[1], 10) : 50,
        gstPercent: gstMatch ? parseInt(gstMatch[1], 10) : 12,
      });
    });

    processParsedDataArray(rawObjects);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);

    const reader = new FileReader();
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv")) {
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsName = wb.SheetNames[0];
          const ws = wb.Sheets[wsName];
          const data: any[] = XLSX.utils.sheet_to_json(ws);
          if (data && data.length > 0) {
            processParsedDataArray(data);
          } else {
            alert("Uploaded spreadsheet is empty.");
          }
        } catch (err) {
          alert("Error parsing spreadsheet file. Please check file format.");
        }
      };
      reader.readAsBinaryString(file);
    } else {
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        setRawText(text);
        parseRawText();
      };
      reader.readAsText(file);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);

    setIsExtractingImage(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64 = evt.target?.result as string;
      try {
        const res = await fetch("/api/ai/extract-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type || "image/jpeg",
          }),
        });
        const data = await res.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          processParsedDataArray(data.products);
        } else {
          alert("Could not extract products automatically from image. Switched to raw text editor.");
          setImportMode("text");
        }
      } catch (err: any) {
        alert("Image OCR processing error: " + err.message);
      } finally {
        setIsExtractingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateParsedItem = (index: number, field: string, val: any) => {
    const updated = [...parsedItems];
    updated[index][field] = val;

    // Recalculate validation status
    const item = updated[index];
    if (item.batchNumber && item.expiryDate) {
      item.status = "Ready";
      item.statusMsg = "Ready for import";
    }
    setParsedItems(updated);
  };

  const handleConfirmImport = () => {
    const validItems = parsedItems.filter((i) => i.status !== "Duplicate");
    if (validItems.length === 0) {
      alert("No valid items to import.");
      return;
    }
    onImport(validItems);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <Upload className="w-5 h-5 text-emerald-500" />
            <span>Smart Bulk Medicine Import Engine</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "input" ? (
          <div className="space-y-4">
            {/* Input Method Navigation Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => setImportMode("text")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                  importMode === "text"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1. Paste Text</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode("file")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                  importMode === "file"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>2. Upload File (.xlsx/.csv/.pdf)</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode("image")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                  importMode === "image"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>3. Upload Image / Bill OCR</span>
              </button>
            </div>

            {/* TAB 1: Paste Raw Text */}
            {importMode === "text" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Paste unstructured invoice text, distributor emails, or CSV lines. The engine extracts medicine name, batch, expiry, MRP, rate & quantity automatically.
                </p>
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    Paste Catalog or Stock Data Below:
                  </label>
                  <textarea
                    rows={7}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste medicine names with batch, MRP, expiry or rates..."
                    className="w-full p-3 font-mono text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={parseRawText}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-emerald-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Parse & Preview</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Upload File (.xlsx, .xls, .csv, .pdf, .txt) */}
            {importMode === "file" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload distributor excel stock sheets (.xlsx, .xls), CSV files, or bill documents.
                </p>
                <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-3">
                  <FileSpreadsheet className="w-10 h-10 text-emerald-500 mx-auto" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Choose Excel or CSV File</h4>
                    <p className="text-xs text-slate-400">Supports .xlsx, .xls, .csv, .pdf, and .txt files</p>
                  </div>
                  <label className="inline-flex items-center px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all">
                    <span>Browse & Upload File</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,.pdf,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {selectedFileName && (
                    <p className="text-xs font-mono font-bold text-emerald-400">Selected: {selectedFileName}</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Upload Image / Gallery OCR */}
            {importMode === "image" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload a photo of printed invoice, distributor bill, or scanned stock list. Gemini AI OCR automatically recognizes products, batches, rates, and expiry dates.
                </p>
                <div className="p-8 border-2 border-dashed border-emerald-500/40 rounded-3xl bg-emerald-500/5 dark:bg-emerald-500/10 text-center space-y-3">
                  {isExtractingImage ? (
                    <div className="space-y-2 py-4">
                      <Sparkles className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                      <p className="text-xs font-bold text-emerald-400">Analyzing invoice image with Gemini AI OCR...</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-10 h-10 text-emerald-500 mx-auto" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Upload Invoice Photo / Gallery Image</h4>
                        <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP scanned photos & screenshots</p>
                      </div>
                      <label className="inline-flex items-center px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all">
                        <span>Select Image from Gallery</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {selectedFileName && (
                        <p className="text-xs font-mono font-bold text-emerald-400">Selected: {selectedFileName}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Validation Preview ({parsedItems.length} Products Extracted)</span>
              </p>
              <button
                onClick={() => setStep("input")}
                className="text-xs text-emerald-500 hover:underline font-bold"
              >
                ← Back to Upload
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Review and edit any field directly in the table below. Missing batches or expiries are highlighted in amber/red badges for safety before importing to inventory stock.
            </p>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl max-h-[50vh]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Validation</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Batch #</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3 text-right">MRP (₹)</th>
                    <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "Ready"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                              : item.status === "Needs Batch"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateParsedItem(idx, "name", e.target.value)}
                          className="bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-full font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 font-mono">
                        <input
                          type="text"
                          value={item.batchNumber}
                          placeholder="Req. Batch #"
                          onChange={(e) => handleUpdateParsedItem(idx, "batchNumber", e.target.value)}
                          className={`bg-transparent border-b border-dashed focus:outline-none w-28 font-bold ${
                            !item.batchNumber ? "text-rose-400 border-rose-500 font-bold" : "text-emerald-400 border-slate-400"
                          }`}
                        />
                      </td>
                      <td className="py-2 px-3 font-mono">
                        <input
                          type="text"
                          value={item.expiryDate}
                          placeholder="YYYY-MM-DD"
                          onChange={(e) => handleUpdateParsedItem(idx, "expiryDate", e.target.value)}
                          className={`bg-transparent border-b border-dashed focus:outline-none w-28 ${
                            !item.expiryDate ? "text-rose-400 border-rose-500 font-bold" : "border-slate-400"
                          }`}
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold">
                        <input
                          type="number"
                          value={item.mrp}
                          onChange={(e) => handleUpdateParsedItem(idx, "mrp", Number(e.target.value) || 0)}
                          className="bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-16 text-right font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold">
                        <input
                          type="number"
                          value={item.sellingRate}
                          onChange={(e) => handleUpdateParsedItem(idx, "sellingRate", Number(e.target.value) || 0)}
                          className="bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-16 text-right font-bold text-emerald-400"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold">
                        <input
                          type="number"
                          value={item.stockQuantity}
                          onChange={(e) => handleUpdateParsedItem(idx, "stockQuantity", Number(e.target.value) || 0)}
                          className="bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-14 text-right font-bold text-white"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-400">
                Ready to import {parsedItems.filter((i) => i.status !== "Duplicate").length} verified items into stock.
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setStep("input")}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-emerald-500/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm & Import Products</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
