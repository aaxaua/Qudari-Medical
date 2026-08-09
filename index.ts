export type UserRole = "Admin" | "Manager" | "Staff" | "Accountant";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  permissions: {
    billing: boolean;
    inventory: boolean;
    customers: boolean;
    ledger: boolean;
    reports: boolean;
    analytics: boolean;
    settings: boolean;
  };
}

export type ProductCategory =
  | "Tablet"
  | "Capsule"
  | "Syrup"
  | "Injection"
  | "Cream/Lotion"
  | "Medical Equipment"
  | "Medical Device"
  | "Drops/Eye Care"
  | "Ointment";

export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Expired" | "Expiring Soon";

export interface Product {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  companyName: string;
  category: ProductCategory;
  subcategory?: string;
  productType: string;
  packSize: string;
  strength: string;
  unit: string;
  hsnCode: string;
  gstPercent: number; // e.g. 5, 12, 18
  mrp: number;
  purchaseRate: number;
  sellingRate: number;
  discountPercent: number;
  barcode: string;
  qrCode?: string;
  batchNumber: string;
  mfdDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  rackNumber: string;
  shelfNumber: string;
  supplier: string;
  description: string;
  imageUrl?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StockHistoryItem {
  id: string;
  productId: string;
  productName: string;
  date: string;
  time: string;
  user: string;
  type: "ADD" | "REMOVE" | "ADJUST" | "SALE" | "RETURN";
  oldQty: number;
  newQty: number;
  changeQty: number;
  reason: string;
  invoiceRef?: string;
  supplier?: string;
}

export interface Customer {
  id: string;
  code: string;
  partyName: string;
  contactPerson: string;
  mobileNumber: string;
  whatsAppNumber: string;
  email: string;
  gstNumber: string;
  drugLicenseNumber: string;
  panNumber: string;
  billingAddress: string;
  shippingAddress: string;
  city: string;
  state: string;
  pinCode: string;
  creditLimit: number;
  openingBalance: number;
  currentBalance: number; // positive = customer owes us (debit), negative = advance
  paymentTerms: string;
  businessCategory: "Retail Store" | "Wholesaler" | "Hospital/Clinic" | "Individual";
  notes?: string;
  status: "Active" | "Inactive";
  profileImage?: string;
  createdAt: string;
}

export type PaymentMode = "Cash" | "UPI" | "Card" | "Bank Transfer" | "Cheque" | "Mixed";

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  date: string;
  time: string;
  mode: PaymentMode;
  referenceNumber: string; // UTR, Cheque #, TXN ID
  remarks: string;
  collectedBy: string;
  balanceBefore: number;
  balanceAfter: number;
}

export interface LedgerEntry {
  id: string;
  customerId: string;
  date: string;
  time: string;
  reference: string; // Invoice # or Receipt #
  description: string;
  debit: number; // Invoice amount added to balance
  credit: number; // Payment subtracted from balance
  balance: number; // Running balance after transaction
  paymentMode?: string;
  remarks?: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  expiryDate: string;
  qty: number;
  freeQty: number;
  mrp: number;
  sellingRate: number;
  discountPercent: number;
  gstPercent: number;
  amount: number; // (qty * rate) - discount + gst
}

export type InvoiceStatus = "Paid" | "Pending" | "Partially Paid" | "Draft" | "Returned" | "Cancelled";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerGst: string;
  customerAddress: string;
  date: string; // YYYY-MM-DD
  time: string;
  salesperson: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  gstAmount: number;
  roundOff: number;
  previousBalance: number;
  netAmount: number;
  paidAmount: number;
  pendingBalance: number;
  grandTotal: number;
  paymentType: PaymentMode | "Credit";
  status: InvoiceStatus;
  termsAndConditions: string;
  createdAt: string;
}

export interface BusinessProfile {
  name: string;
  ownerName: string;
  tagline: string;
  logoUrl?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  mobile: string;
  whatsApp: string;
  email: string;
  website: string;
  gstin: string;
  drugLicense20B: string;
  drugLicense21B: string;
  panNumber: string;
  fssaiNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  upiQrUrl?: string;
}

export interface InvoiceSettings {
  prefix: string;
  startNumber: number;
  autoNumbering: boolean;
  footerText: string;
  terms: string;
  showQrCode: boolean;
  showGstBreakup: boolean;
  showPreviousBalance: boolean;
  showMrp: boolean;
  showRate: boolean;
  roundOffEnabled: boolean;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  module: "Billing" | "Inventory" | "Customers" | "Ledger" | "Settings" | "AI" | "Authentication";
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  category: "stock" | "expiry" | "payment" | "billing" | "system";
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface FilterState {
  searchTerm: string;
  category: string;
  company: string;
  status: string;
  expiryRange: string;
  dateRange: string;
  startDate?: string;
  endDate?: string;
}
