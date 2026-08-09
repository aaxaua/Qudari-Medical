import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import {
  Product,
  Customer,
  Invoice,
  LedgerEntry,
  PaymentRecord,
  BusinessProfile,
  InvoiceSettings,
  User,
  ActivityLog,
  SystemNotification,
} from "../types";
import {
  initialBusinessProfile,
  initialInvoiceSettings,
  initialUsers,
} from "../lib/initialData";

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  businessProfile: BusinessProfile;
  setBusinessProfile: (profile: BusinessProfile) => void;
  invoiceSettings: InvoiceSettings;
  setInvoiceSettings: (settings: InvoiceSettings) => void;
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  ledgerEntries: LedgerEntry[];
  payments: PaymentRecord[];
  activityLogs: ActivityLog[];
  notifications: SystemNotification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;
  aiDrawerOpen: boolean;
  setAiDrawerOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  toggleDarkMode: () => void;
  isDataLoading: boolean;

  // Actions
  addInvoice: (invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">) => Invoice;
  cancelInvoice: (invoiceId: string, reason: string) => void;
  markInvoiceSucceeded: (invoiceId: string) => void;
  returnInvoice: (invoiceId: string, returnItemIds: string[]) => void;
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => { success: boolean; message: string; product?: Product };
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  adjustStock: (productId: string, qtyChange: number, type: "ADD" | "REMOVE" | "ADJUST", reason: string) => void;
  bulkImportProducts: (importedList: Partial<Product>[]) => { imported: number; skipped: number; total: number };
  addCustomer: (customer: Omit<Customer, "id" | "code" | "createdAt" | "currentBalance">) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => { success: boolean; message: string };
  addPayment: (payment: Omit<PaymentRecord, "id" | "receiptNumber" | "balanceBefore" | "balanceAfter">) => PaymentRecord;
  receiveCustomerPayment: (
    customerId: string,
    amount: number,
    mode: PaymentRecord["mode"],
    referenceNumber: string,
    remarks: string,
    customDate?: string
  ) => PaymentRecord;
  addNotification: (title: string, message: string, type: SystemNotification["type"], category: SystemNotification["category"]) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  clearProducts: () => void;
  clearCustomers: () => void;
  clearInvoices: () => void;
  clearLedgers: () => void;
  clearAnalyticsData: () => void;
  exportAllData: () => string;
  importAllData: (jsonData: string) => boolean;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [businessProfile, setBusinessProfileState] = useState<BusinessProfile>(initialBusinessProfile);
  const [invoiceSettings, setInvoiceSettingsState] = useState<InvoiceSettings>(initialInvoiceSettings);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [globalSearchOpen, setGlobalSearchOpen] = useState<boolean>(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("qmms_theme");
    return saved !== null ? saved === "dark" : true;
  });

  // Current user derived from Firebase Auth
  const currentUser: User = {
    id: user?.uid || "guest",
    name: user?.displayName || user?.email?.split("@")[0] || "Pharmacist",
    email: user?.email || "user@qadrimedical.com",
    role: "Admin",
    avatar: user?.photoURL || "",
    permissions: {
      billing: true,
      inventory: true,
      customers: true,
      ledger: true,
      reports: true,
      analytics: true,
      settings: true,
    },
  };

  const setCurrentUser = () => {};

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("qmms_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("qmms_theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Load User Data from Firestore on Auth Login
  useEffect(() => {
    let isSubscribed = true;

    async function loadUserData() {
      if (!user) {
        setIsDataLoaded(false);
        setIsDataLoading(false);
        setProducts([]);
        setCustomers([]);
        setInvoices([]);
        setLedgerEntries([]);
        setPayments([]);
        setActivityLogs([]);
        return;
      }

      setIsDataLoading(true);
      try {
        const appDataRef = doc(db, "users", user.uid, "appData", "main");
        const docSnap = await getDoc(appDataRef);

        if (docSnap.exists() && isSubscribed) {
          const data = docSnap.data();
          setProducts(data.products || []);
          setCustomers(data.customers || []);
          setInvoices(data.invoices || []);
          setLedgerEntries(data.ledgerEntries || []);
          setPayments(data.payments || []);
          setActivityLogs(data.activityLogs || []);
          if (data.businessProfile) setBusinessProfileState(data.businessProfile);
          if (data.invoiceSettings) setInvoiceSettingsState(data.invoiceSettings);
        } else if (isSubscribed) {
          // New User workspace creation
          const newProf = { ...initialBusinessProfile, email: user.email || initialBusinessProfile.email };
          setBusinessProfileState(newProf);
          setProducts([]);
          setCustomers([]);
          setInvoices([]);
          setLedgerEntries([]);
          setPayments([]);
          setActivityLogs([]);

          await setDoc(appDataRef, {
            products: [],
            customers: [],
            invoices: [],
            ledgerEntries: [],
            payments: [],
            activityLogs: [],
            businessProfile: newProf,
            invoiceSettings: initialInvoiceSettings,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error loading user Firestore data:", err);
      } finally {
        if (isSubscribed) {
          setIsDataLoaded(true);
          setIsDataLoading(false);
        }
      }
    }

    loadUserData();

    return () => {
      isSubscribed = false;
    };
  }, [user]);

  // Debounced Auto-Save to Firestore whenever data changes
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!user || !isDataLoaded) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const appDataRef = doc(db, "users", user.uid, "appData", "main");
        await setDoc(appDataRef, {
          products,
          customers,
          invoices,
          ledgerEntries,
          payments,
          activityLogs,
          businessProfile,
          invoiceSettings,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Auto-save to Firestore failed:", err);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    user,
    isDataLoaded,
    products,
    customers,
    invoices,
    ledgerEntries,
    payments,
    activityLogs,
    businessProfile,
    invoiceSettings,
  ]);

  // Log activity helper
  const logActivity = (action: string, module: ActivityLog["module"], details: string) => {
    const newLog: ActivityLog = {
      id: "log_" + Date.now(),
      user: currentUser.name,
      action,
      module,
      details,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Add Notification helper
  const addNotification = (
    title: string,
    message: string,
    type: SystemNotification["type"],
    category: SystemNotification["category"]
  ) => {
    const newNotif: SystemNotification = {
      id: "notif_" + Date.now() + Math.random().toString(36).substr(2, 4),
      title,
      message,
      type,
      category,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Save Settings wrapper
  const setBusinessProfile = (profile: BusinessProfile) => {
    setBusinessProfileState(profile);
    logActivity("Updated Business Profile", "Settings", `Updated address/GSTIN for ${profile.name}`);
    addNotification("Business Profile Updated", "Company profile details saved successfully.", "success", "system");
  };

  const setInvoiceSettings = (settings: InvoiceSettings) => {
    setInvoiceSettingsState(settings);
    logActivity("Updated Invoice Settings", "Settings", "Updated invoice numbering prefix & footer terms.");
    addNotification("Invoice Settings Updated", "Invoice templates & rules updated.", "success", "system");
  };

  // Add Invoice
  const addInvoice = (invoiceData: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">): Invoice => {
    const nextNum = invoiceSettings.startNumber + invoices.length;
    const invNumber = `${invoiceSettings.prefix}${nextNum}`;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: "inv_" + Date.now(),
      invoiceNumber: invNumber,
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Reduce stock for items
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const item = newInvoice.items.find((i) => i.productId === p.id);
        if (item) {
          const totalQtyUsed = item.qty + (item.freeQty || 0);
          const newQty = Math.max(0, p.stockQuantity - totalQtyUsed);
          let newStatus = p.status;
          if (newQty === 0) newStatus = "Out of Stock";
          else if (newQty <= p.minStockLevel) newStatus = "Low Stock";

          return {
            ...p,
            stockQuantity: newQty,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    // Update customer balance & create ledger entry
    const customer = customers.find((c) => c.id === newInvoice.customerId);
    const prevBal = customer ? customer.currentBalance : 0;
    const newBal = prevBal + newInvoice.pendingBalance;

    if (customer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, currentBalance: newBal } : c))
      );
    }

    const newLedger: LedgerEntry = {
      id: "led_" + Date.now(),
      customerId: newInvoice.customerId,
      date: newInvoice.date,
      time: newInvoice.time,
      reference: invNumber,
      description: `Invoice Generation (${newInvoice.items.length} items)`,
      debit: newInvoice.netAmount,
      credit: newInvoice.paidAmount,
      balance: newBal,
      paymentMode: newInvoice.paymentType,
      remarks: `Grand Total ₹${newInvoice.grandTotal.toFixed(2)}, Paid ₹${newInvoice.paidAmount.toFixed(2)}`,
    };
    setLedgerEntries((prev) => [newLedger, ...prev]);

    logActivity(
      `Created Invoice ${invNumber}`,
      "Billing",
      `Invoice generated for ${newInvoice.customerName} worth ₹${newInvoice.grandTotal.toFixed(2)}`
    );

    addNotification(
      "Invoice Generated",
      `Invoice ${invNumber} created for ${newInvoice.customerName}. Stock and ledger updated automatically.`,
      "success",
      "billing"
    );

    return newInvoice;
  };

  // Cancel Invoice
  const cancelInvoice = (invoiceId: string, reason: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv || inv.status === "Cancelled") return;

    // Restore stock
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const item = inv.items.find((i) => i.productId === p.id);
        if (item) {
          const restoredQty = p.stockQuantity + item.qty + (item.freeQty || 0);
          return {
            ...p,
            stockQuantity: restoredQty,
            status: restoredQty > p.minStockLevel ? "In Stock" : "Low Stock",
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    // Reverse customer balance
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === inv.customerId
          ? { ...c, currentBalance: Math.max(0, c.currentBalance - inv.pendingBalance) }
          : c
      )
    );

    // Add cancellation ledger reversal entry
    if (inv.pendingBalance > 0) {
      const cust = customers.find((c) => c.id === inv.customerId);
      const newBal = Math.max(0, (cust?.currentBalance || 0) - inv.pendingBalance);
      const reversalLedger: LedgerEntry = {
        id: "led_" + Date.now(),
        customerId: inv.customerId,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        reference: `CANCEL-${inv.invoiceNumber}`,
        description: `Invoice ${inv.invoiceNumber} Cancelled (${reason})`,
        debit: 0,
        credit: inv.pendingBalance,
        balance: newBal,
        remarks: `Cancellation Reason: ${reason}`,
      };
      setLedgerEntries((prev) => [reversalLedger, ...prev]);
    }

    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: "Cancelled" } : i))
    );

    logActivity(`Cancelled Invoice ${inv.invoiceNumber}`, "Billing", `Reason: ${reason}`);
    addNotification("Invoice Cancelled", `Invoice ${inv.invoiceNumber} cancelled. Stock restored.`, "info", "billing");
  };

  // Mark Invoice as Succeeded / Paid in Full
  const markInvoiceSucceeded = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv || inv.status === "Cancelled" || inv.status === "Paid") return;

    const remainingPending = inv.pendingBalance;

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              status: "Paid",
              paidAmount: i.grandTotal,
              pendingBalance: 0,
            }
          : i
      )
    );

    if (remainingPending > 0) {
      const cust = customers.find((c) => c.id === inv.customerId);
      const newBal = Math.max(0, (cust?.currentBalance || 0) - remainingPending);

      if (cust) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === cust.id ? { ...c, currentBalance: newBal } : c))
        );
      }

      const settlementLedger: LedgerEntry = {
        id: "led_" + Date.now(),
        customerId: inv.customerId,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        reference: `SETTLE-${inv.invoiceNumber}`,
        description: `Full Invoice Settlement (${inv.invoiceNumber})`,
        debit: 0,
        credit: remainingPending,
        balance: newBal,
        paymentMode: "Cash",
        remarks: "Invoice marked as Succeeded / Paid in Full",
      };
      setLedgerEntries((prev) => [settlementLedger, ...prev]);
    }

    logActivity(`Invoice ${inv.invoiceNumber} Succeeded`, "Billing", `Settled balance ₹${remainingPending.toFixed(2)}`);
    addNotification("Invoice Payment Succeeded", `Invoice ${inv.invoiceNumber} status updated to Paid / Succeeded.`, "success", "billing");
  };

  // Return Invoice
  const returnInvoice = (invoiceId: string, returnItemIds: string[]) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    let refundTotal = 0;
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const item = inv.items.find((i) => i.productId === p.id && returnItemIds.includes(i.id));
        if (item) {
          refundTotal += item.amount;
          return {
            ...p,
            stockQuantity: p.stockQuantity + item.qty,
            status: "In Stock",
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === inv.customerId
          ? { ...c, currentBalance: Math.max(0, c.currentBalance - refundTotal) }
          : c
      )
    );

    const newLedger: LedgerEntry = {
      id: "led_" + Date.now(),
      customerId: inv.customerId,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      reference: `CN-${inv.invoiceNumber}`,
      description: `Sales Return Credit Note against ${inv.invoiceNumber}`,
      debit: 0,
      credit: refundTotal,
      balance: Math.max(0, (customers.find((c) => c.id === inv.customerId)?.currentBalance || 0) - refundTotal),
      remarks: "Goods returned to stock",
    };
    setLedgerEntries((prev) => [newLedger, ...prev]);

    logActivity(`Sales Return for ${inv.invoiceNumber}`, "Billing", `Credit note ₹${refundTotal.toFixed(2)} generated.`);
    addNotification("Sales Return Processed", `Credit note ₹${refundTotal.toFixed(2)} issued for ${inv.customerName}.`, "success", "billing");
  };

  // Product CRUD
  const addProduct = (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): { success: boolean; message: string; product?: Product } => {
    const duplicate = products.find(
      (p) =>
        p.name.toLowerCase().trim() === productData.name.toLowerCase().trim() &&
        p.batchNumber.toLowerCase().trim() === productData.batchNumber.toLowerCase().trim()
    );

    if (duplicate) {
      return {
        success: false,
        message: `Product '${productData.name}' with Batch '${productData.batchNumber}' already exists in inventory.`,
      };
    }

    const newProduct: Product = {
      ...productData,
      id: "prod_" + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);
    logActivity(`Added Product '${newProduct.name}'`, "Inventory", `Batch: ${newProduct.batchNumber}, MRP: ₹${newProduct.mrp}`);
    addNotification("Product Added", `'${newProduct.name}' added to inventory successfully.`, "success", "stock");

    return { success: true, message: "Product added successfully", product: newProduct };
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p)));
    logActivity(`Updated Product '${updated.name}'`, "Inventory", `Stock: ${updated.stockQuantity}, Price: ₹${updated.sellingRate}`);
    addNotification("Product Updated", `'${updated.name}' details updated.`, "info", "stock");
  };

  const deleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (prod) {
      logActivity(`Deleted Product '${prod.name}'`, "Inventory", `Removed batch ${prod.batchNumber}`);
      addNotification("Product Deleted", `'${prod.name}' removed from inventory.`, "warning", "stock");
    }
  };

  const adjustStock = (productId: string, qtyChange: number, type: "ADD" | "REMOVE" | "ADJUST", reason: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          let newQty = p.stockQuantity;
          if (type === "ADD") newQty += qtyChange;
          else if (type === "REMOVE") newQty = Math.max(0, newQty - qtyChange);
          else if (type === "ADJUST") newQty = qtyChange;

          let newStatus = p.status;
          if (newQty === 0) newStatus = "Out of Stock";
          else if (newQty <= p.minStockLevel) newStatus = "Low Stock";
          else if (newStatus === "Out of Stock" || newStatus === "Low Stock") newStatus = "In Stock";

          return { ...p, stockQuantity: newQty, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );

    const p = products.find((pr) => pr.id === productId);
    if (p) {
      logActivity(`Stock Adjustment (${type})`, "Inventory", `'${p.name}' adjusted by ${qtyChange}. Reason: ${reason}`);
      addNotification("Stock Adjusted", `'${p.name}' quantity updated.`, "info", "stock");
    }
  };

  const bulkImportProducts = (importedList: Partial<Product>[]): { imported: number; skipped: number; total: number } => {
    let importedCount = 0;
    let skippedCount = 0;

    const newProducts: Product[] = [];

    importedList.forEach((item, idx) => {
      if (!item.name) {
        skippedCount++;
        return;
      }

      const duplicate = products.some(
        (p) =>
          p.name.toLowerCase().trim() === item.name?.toLowerCase().trim() &&
          p.batchNumber?.toLowerCase().trim() === (item.batchNumber || "B2026-01").toLowerCase().trim()
      );

      if (duplicate) {
        skippedCount++;
        return;
      }

      const newProd: Product = {
        id: "prod_imp_" + Date.now() + "_" + idx,
        name: item.name,
        genericName: item.genericName || item.name,
        brandName: item.brandName || item.name.split(" ")[0],
        companyName: item.companyName || "General Pharma",
        category: (item.category as any) || "Tablet",
        productType: item.productType || "Tablet",
        packSize: item.packSize || "10 Strips",
        strength: item.strength || "Standard",
        unit: item.unit || "Strip",
        hsnCode: item.hsnCode || "3004",
        gstPercent: item.gstPercent || 12,
        mrp: item.mrp || 100,
        purchaseRate: item.purchaseRate || 60,
        sellingRate: item.sellingRate || 80,
        discountPercent: item.discountPercent || 5,
        barcode: item.barcode || "890" + Math.floor(100000000 + Math.random() * 900000000),
        batchNumber: item.batchNumber || "IMP2026-" + Math.floor(100 + Math.random() * 900),
        mfdDate: item.mfdDate || "2026-01-01",
        expiryDate: item.expiryDate || "2028-12-31",
        stockQuantity: item.stockQuantity || 100,
        minStockLevel: item.minStockLevel || 20,
        maxStockLevel: item.maxStockLevel || 500,
        rackNumber: item.rackNumber || "A-1",
        shelfNumber: item.shelfNumber || "S-1",
        supplier: item.supplier || "Imported Supplier",
        description: item.description || "Bulk imported product",
        status: (item.stockQuantity || 100) <= 20 ? "Low Stock" : "In Stock",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      newProducts.push(newProd);
      importedCount++;
    });

    if (newProducts.length > 0) {
      setProducts((prev) => [...newProducts, ...prev]);
    }

    logActivity(`Bulk Product Import`, "Inventory", `Imported ${importedCount} items, skipped ${skippedCount} duplicates.`);
    addNotification("Bulk Import Complete", `Successfully imported ${importedCount} products.`, "success", "stock");

    return { imported: importedCount, skipped: skippedCount, total: importedList.length };
  };

  // Customer CRUD
  const addCustomer = (customerData: Omit<Customer, "id" | "code" | "createdAt" | "currentBalance">): Customer => {
    const code = `PARTY-${100 + customers.length + 1}`;
    const newCustomer: Customer = {
      ...customerData,
      id: "cust_" + Date.now(),
      code,
      currentBalance: customerData.openingBalance || 0,
      createdAt: new Date().toISOString(),
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    if (newCustomer.openingBalance > 0) {
      const openingLedger: LedgerEntry = {
        id: "led_" + Date.now(),
        customerId: newCustomer.id,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        reference: "OB-2026",
        description: "Opening Account Balance",
        debit: newCustomer.openingBalance,
        credit: 0,
        balance: newCustomer.openingBalance,
        remarks: "Initial balance during profile creation",
      };
      setLedgerEntries((prev) => [openingLedger, ...prev]);
    }

    logActivity(`Added Customer '${newCustomer.partyName}'`, "Customers", `GSTIN: ${newCustomer.gstNumber || "N/A"}`);
    addNotification("Customer Registered", `'${newCustomer.partyName}' added to customer directory.`, "success", "system");

    return newCustomer;
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    logActivity(`Updated Customer '${updated.partyName}'`, "Customers", `Credit limit ₹${updated.creditLimit}`);
    addNotification("Customer Details Saved", `'${updated.partyName}' profile updated.`, "info", "system");
  };

  const deleteCustomer = (customerId: string): { success: boolean; message: string } => {
    const hasInvoices = invoices.some((i) => i.customerId === customerId);
    if (hasInvoices) {
      return { success: false, message: "Cannot delete customer because existing invoices and ledger entries are linked." };
    }

    const cust = customers.find((c) => c.id === customerId);
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    if (cust) {
      logActivity(`Deleted Customer '${cust.partyName}'`, "Customers", `Removed from active parties.`);
      addNotification("Customer Deleted", `'${cust.partyName}' removed.`, "warning", "system");
    }

    return { success: true, message: "Customer deleted successfully." };
  };

  // Payment Collection
  const addPayment = (paymentData: Omit<PaymentRecord, "id" | "receiptNumber" | "balanceBefore" | "balanceAfter">): PaymentRecord => {
    const customer = customers.find((c) => c.id === paymentData.customerId);
    const balanceBefore = customer ? customer.currentBalance : 0;
    const balanceAfter = Math.max(0, balanceBefore - paymentData.amount);

    const receiptNum = `REC-${8000 + payments.length + 1}`;

    const newPayment: PaymentRecord = {
      ...paymentData,
      id: "pay_" + Date.now(),
      receiptNumber: receiptNum,
      balanceBefore,
      balanceAfter,
    };

    setPayments((prev) => [newPayment, ...prev]);

    if (customer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, currentBalance: balanceAfter } : c))
      );
    }

    let remaining = paymentData.amount;
    if (remaining > 0) {
      setInvoices((prev) =>
        prev.map((inv) => {
          if (
            inv.customerId === paymentData.customerId &&
            inv.status !== "Cancelled" &&
            inv.pendingBalance > 0 &&
            remaining > 0
          ) {
            const alloc = Math.min(inv.pendingBalance, remaining);
            remaining -= alloc;
            const newPaid = inv.paidAmount + alloc;
            const newPending = Math.max(0, inv.pendingBalance - alloc);
            const newStatus: Invoice["status"] = newPending <= 0.01 ? "Paid" : "Partially Paid";
            return {
              ...inv,
              paidAmount: newPaid,
              pendingBalance: newPending,
              status: newStatus,
            };
          }
          return inv;
        })
      );
    }

    const newLedger: LedgerEntry = {
      id: "led_" + Date.now(),
      customerId: paymentData.customerId,
      date: paymentData.date,
      time: paymentData.time,
      reference: receiptNum,
      description: `Payment Collection (${paymentData.mode})`,
      debit: 0,
      credit: paymentData.amount,
      balance: balanceAfter,
      paymentMode: paymentData.mode,
      remarks: paymentData.remarks || `Ref: ${paymentData.referenceNumber || "Direct Collection"}`,
    };
    setLedgerEntries((prev) => [newLedger, ...prev]);

    logActivity(`Recorded Payment ${receiptNum}`, "Ledger", `Received ₹${paymentData.amount.toFixed(2)} from ${paymentData.customerName} via ${paymentData.mode}`);
    addNotification("Payment Received", `Received ₹${paymentData.amount.toFixed(2)} from ${paymentData.customerName}. Receipt ${receiptNum} issued.`, "success", "payment");

    return newPayment;
  };

  const receiveCustomerPayment = (
    customerId: string,
    amount: number,
    mode: PaymentRecord["mode"],
    referenceNumber: string,
    remarks: string,
    customDate?: string
  ): PaymentRecord => {
    const customer = customers.find((c) => c.id === customerId);
    const now = new Date();
    const dateStr = customDate || now.toLocaleDateString("en-CA");
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return addPayment({
      customerId,
      customerName: customer ? customer.partyName : "Unknown Party",
      amount,
      mode,
      date: dateStr,
      time: timeStr,
      referenceNumber,
      remarks,
      collectedBy: currentUser.name,
    });
  };

  const clearProducts = () => {
    setProducts([]);
    addNotification("Data Cleared", "Product catalog emptied.", "warning", "stock");
  };

  const clearCustomers = () => {
    setCustomers([]);
    addNotification("Data Cleared", "Customer database emptied.", "warning", "system");
  };

  const clearInvoices = () => {
    setInvoices([]);
    addNotification("Data Cleared", "Invoice history emptied.", "warning", "billing");
  };

  const clearLedgers = () => {
    setLedgerEntries([]);
    setPayments([]);
    addNotification("Data Cleared", "Ledger and payment history emptied.", "warning", "payment");
  };

  const clearAnalyticsData = () => {
    setActivityLogs([]);
    addNotification("Analytics Cleared", "All analytics, activity history and logs cleared successfully.", "info", "system");
  };

  const exportAllData = (): string => {
    const backup = {
      products,
      customers,
      invoices,
      ledgerEntries,
      payments,
      businessProfile,
      invoiceSettings,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  };

  const importAllData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.invoices) setInvoices(parsed.invoices);
      if (parsed.ledgerEntries) setLedgerEntries(parsed.ledgerEntries);
      if (parsed.payments) setPayments(parsed.payments);
      if (parsed.businessProfile) setBusinessProfileState(parsed.businessProfile);
      if (parsed.invoiceSettings) setInvoiceSettingsState(parsed.invoiceSettings);
      addNotification("Data Restored", "All system records successfully restored from backup.", "success", "system");
      return true;
    } catch (e) {
      alert("Invalid backup file format!");
      return false;
    }
  };

  const resetToDefaultData = () => {
    setProducts([]);
    setCustomers([]);
    setInvoices([]);
    setLedgerEntries([]);
    setPayments([]);
    setBusinessProfileState(initialBusinessProfile);
    setInvoiceSettingsState(initialInvoiceSettings);
    setActivityLogs([]);
    addNotification("System Reset", "Workspace data cleared.", "info", "system");
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users: initialUsers,
        businessProfile,
        setBusinessProfile,
        invoiceSettings,
        setInvoiceSettings,
        products,
        customers,
        invoices,
        ledgerEntries,
        payments,
        activityLogs,
        notifications,
        activeTab,
        setActiveTab,
        globalSearchOpen,
        setGlobalSearchOpen,
        aiDrawerOpen,
        setAiDrawerOpen,
        mobileMenuOpen,
        setMobileMenuOpen,
        isDarkMode,
        setIsDarkMode,
        toggleDarkMode,
        isDataLoading,
        addInvoice,
        cancelInvoice,
        markInvoiceSucceeded,
        returnInvoice,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        bulkImportProducts,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addPayment,
        receiveCustomerPayment,
        addNotification,
        markNotificationRead,
        clearAllNotifications,
        clearProducts,
        clearCustomers,
        clearInvoices,
        clearLedgers,
        clearAnalyticsData,
        exportAllData,
        importAllData,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
