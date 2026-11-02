import { USER_NAME, USER_ROLE } from "./utils";

export type Avatar = { name: string; initials?: string; variant?: "gray" | "blue" | "indigo" | "teal" | "amber" | "rose" };
export const AVATARS: Record<string, Avatar> = {
  nusrat: { name: "Nusrat Ahmed", initials: "NA", variant: "blue" },
  sajid: { name: "Sajid Hossain", initials: "SH", variant: "indigo" },
  farhana: { name: "Farhana Islam", initials: "FI", variant: "teal" },
  meherun: { name: "Meherun Nisa", initials: "MN", variant: "amber" },
  rafiq: { name: "Rafiq Uddin", initials: "RU", variant: "rose" },
  tanvir: { name: "Tanvir Hasan", initials: "TH", variant: "gray" },
  arif: { name: "Arif Rahman", initials: "AR", variant: "indigo" },
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reserved: number;
  threshold: number;
  warehouse: string;
  image?: string;
  rating?: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
};

export const PRODUCTS: Product[] = [
  {
    id: "p-001", name: "Logitech MX Master 3S", sku: "NXR-3001", category: "Electronics",
    price: 12500, cost: 8200, stock: 18, reserved: 2, threshold: 15, warehouse: "Dhaka HQ",
    image: "/assets/product-graphite-logitech-mx-master-3s-wireless-ergonomic-mouse.jpg", rating: 4.8, status: "in_stock",
  },
  {
    id: "p-002", name: "Samsung T7 SSD 1TB", sku: "NXR-3002", category: "Storage",
    price: 9500, cost: 6400, stock: 9, reserved: 0, threshold: 12, warehouse: "Dhaka HQ",
    image: "/assets/product-samsung-t7-slim-blue-portable-ssd.jpg", rating: 4.6, status: "low_stock",
  },
  {
    id: "p-003", name: "Keychron K2 Pro", sku: "NXR-3003", category: "Electronics",
    price: 11000, cost: 7400, stock: 5, reserved: 0, threshold: 12, warehouse: "Chittagong",
    image: "/assets/product-keychron-k2-mechanical-keyboard-with-graphite-keycaps.jpg", rating: 4.7, status: "low_stock",
  },
  {
    id: "p-004", name: "Dell P2425H Monitor", sku: "NXR-3004", category: "Computers",
    price: 18500, cost: 13000, stock: 4, reserved: 0, threshold: 10, warehouse: "Dhaka HQ",
    image: "/assets/product-dell-p2425h-slim-black-desktop-monitor.jpg", rating: 4.5, status: "low_stock",
  },
  {
    id: "p-005", name: "Anker 65W Charger", sku: "NXR-3005", category: "Accessories",
    price: 4500, cost: 2900, stock: 72, reserved: 4, threshold: 20, warehouse: "Sylhet",
    image: "/assets/product-anker-compact-white-usb-c-wall-charger.jpg", rating: 4.3, status: "in_stock",
  },
  {
    id: "p-006", name: "TP-Link Archer AX23", sku: "NXR-3006", category: "Networking",
    price: 7500, cost: 4800, stock: 31, reserved: 1, threshold: 10, warehouse: "Dhaka HQ",
    image: "/assets/product-tp-link-black-wireless-router-with-four-antennas.jpg", rating: 4.2, status: "in_stock",
  },
  {
    id: "p-007", name: "Jabra Evolve Headset", sku: "NXR-3007", category: "Audio",
    price: 8900, cost: 5600, stock: 14, reserved: 0, threshold: 12, warehouse: "Chittagong",
    image: "/assets/product-jabra-evolve-black-wired-office-headset.jpg", rating: 4.1, status: "in_stock",
  },
  {
    id: "p-008", name: "A4 Paper Ream", sku: "NXR-3008", category: "Office supplies",
    price: 650, cost: 420, stock: 156, reserved: 6, threshold: 24, warehouse: "Dhaka HQ",
    image: "/assets/product-ream-of-white-a4-paper-in-blue-packaging.jpg", rating: 4.0, status: "in_stock",
  },
];

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  spent: number;
  status: "active" | "inactive";
  avatar?: string;
  tier: "Enterprise" | "Business" | "Standard";
};

export const CUSTOMERS: Customer[] = [
  { id: "c-001", name: "Northstar Retail", email: "accounts@northstar.com", company: "Retail", spent: 1104000, status: "active", avatar: "northstar", tier: "Enterprise" },
  { id: "c-002", name: "Meghna Enterprise", email: "payroll@meghna.ltd", company: "Distribution", spent: 332000, status: "active", avatar: "meghna", tier: "Business" },
  { id: "c-003", name: "Dhaka Digital Ltd.", email: "ops@dhakadigital.com", company: "Technology", spent: 990000, status: "active", avatar: "dhakai", tier: "Enterprise" },
  { id: "c-004", name: "Vertex Solutions", email: "billing@vertex.io", company: "SaaS", spent: 706000, status: "active", avatar: "vertex", tier: "Business" },
  { id: "c-005", name: "Bengal Office Co.", email: "hello@bengaloffice.com", company: "Corporate", spent: 563000, status: "active", avatar: "bengal", tier: "Business" },
  { id: "c-006", name: "Orion Technologies", email: "finance@orion.tech", company: "Technology", spent: 412000, status: "inactive", avatar: "orion", tier: "Standard" },
];

export type Sale = {
  id: string;
  date: string;
  customer: string;
  customerEmail: string;
  rep: string;
  repAvatar?: string;
  total: number;
  tax: number;
  paymentMethod: "Cash" | "Bank transfer" | "bKash" | "Card";
  status: "Paid" | "Unpaid" | "Partial" | "Overdue";
  items: { productId: string; name: string; qty: number; price: number }[];
};

export const SALES: Sale[] = [
  { id: "SAL-2026-1048", date: "2026-10-29", customer: "Bengal Office Co.", customerEmail: "hello@bengaloffice.com", rep: "Nusrat Ahmed", repAvatar: "nusrat", total: 149625, tax: 23875, paymentMethod: "Bank transfer", status: "Unpaid", items: [] },
  { id: "SAL-2026-1047", date: "2026-10-28", customer: "Vertex Solutions", customerEmail: "billing@vertex.io", rep: "Tanvir Hasan", total: 86400, tax: 12000, paymentMethod: "bKash", status: "Paid", items: [] },
  { id: "SAL-2026-1046", date: "2026-10-28", customer: "Dhaka Digital Ltd.", customerEmail: "ops@dhakadigital.com", rep: "Arif Rahman", total: 212100, tax: 31200, paymentMethod: "Bank transfer", status: "Partial", items: [] },
  { id: "SAL-2026-1045", date: "2026-10-27", customer: "Meghna Enterprise", customerEmail: "payroll@meghna.ltd", rep: "Arif Rahman", total: 48750, tax: 7250, paymentMethod: "Cash", status: "Paid", items: [] },
  { id: "SAL-2026-1044", date: "2026-10-27", customer: "Northstar Retail", customerEmail: "accounts@northstar.com", rep: "Tanvir Hasan", total: 64800, tax: 9200, paymentMethod: "Bank transfer", status: "Paid", items: [] },
  { id: "SAL-2026-1043", date: "2026-10-26", customer: "Orion Technologies", customerEmail: "finance@orion.tech", rep: "Nusrat Ahmed", total: 74500, tax: 11000, paymentMethod: "Card", status: "Paid", items: [] },
  { id: "SAL-2026-1042", date: "2026-10-25", customer: "Vertex Solutions", customerEmail: "billing@vertex.io", rep: "Arif Rahman", total: 32200, tax: 4500, paymentMethod: "bKash", status: "Overdue", items: [] },
  { id: "SAL-2026-1041", date: "2026-10-25", customer: "Northstar Retail", customerEmail: "accounts@northstar.com", rep: "Tanvir Hasan", total: 118500, tax: 18500, paymentMethod: "Bank transfer", status: "Paid", items: [] },
];

export type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  status: "Active" | "On leave" | "Inactive";
  avatar?: string;
  ssn?: string;
};

export const EMPLOYEES: Employee[] = [
  { id: "e-001", name: "Arif Rahman", role: "Sales Manager", department: "Sales", email: "arif@apexerp.com", phone: "+880 171 234 5678", hireDate: "2021-03-12", status: "Active", avatar: "arif" },
  { id: "e-002", name: "Farhana Islam", role: "Stock Controller", department: "Inventory", email: "farhana@apexerp.com", phone: "+880 172 345 6789", hireDate: "2020-11-08", status: "Active", avatar: "farhana" },
  { id: "e-003", name: "Sajid Hossain", role: "Finance Officer", department: "Finance", email: "sajid@apexerp.com", phone: "+880 173 456 7890", hireDate: "2019-07-22", status: "Active", avatar: "sajid" },
  { id: "e-004", name: "Meherun Nisa", role: "HR Officer", department: "HR", email: "meherun@apexerp.com", phone: "+880 174 567 8901", hireDate: "2022-01-15", status: "Active", avatar: "meherun" },
  { id: "e-005", name: "Rafiq Uddin", role: "Sales Representative", department: "Sales", email: "rafiq@apexerp.com", phone: "+880 175 678 9012", hireDate: "2023-05-30", status: "On leave", avatar: "rafiq" },
  { id: "e-006", name: "Nusrat Ahmed", role: "Sales Representative", department: "Sales", email: "nusrat@apexerp.com", phone: "+880 176 789 0123", hireDate: "2022-09-14", status: "Active", avatar: "nusrat" },
  { id: "e-007", name: "Tanvir Hasan", role: "Sales Representative", department: "Sales", email: "tanvir@apexerp.com", phone: "+880 177 890 1234", hireDate: "2023-02-19", status: "Active", avatar: "tanvir" },
];

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  reorderAt: number;
  status: "In stock" | "Low stock" | "Out of stock";
  lastUpdated: string;
};

export const INVENTORY: InventoryItem[] = [
  { id: "i-001", name: "Anker 65W Charger", sku: "NXR-3005", warehouse: "Dhaka HQ", onHand: 15, reserved: 0, reorderAt: 20, status: "Low stock", lastUpdated: "2026-10-28" },
  { id: "i-002", name: "Keychron K2 Pro", sku: "NXR-3003", warehouse: "Chittagong", onHand: 25, reserved: 0, reorderAt: 12, status: "Low stock", lastUpdated: "2026-10-27" },
  { id: "i-003", name: "Dell P2425H Monitor", sku: "NXR-3004", warehouse: "Dhaka HQ", onHand: 20, reserved: 0, reorderAt: 10, status: "Low stock", lastUpdated: "2026-10-26" },
  { id: "i-004", name: "Logitech MX Master 3S", sku: "NXR-3001", warehouse: "Dhaka HQ", onHand: 42, reserved: 2, reorderAt: 15, status: "In stock", lastUpdated: "2026-10-29" },
  { id: "i-005", name: "Samsung T7 SSD 1TB", sku: "NXR-3002", warehouse: "Dhaka HQ", onHand: 36, reserved: 0, reorderAt: 12, status: "In stock", lastUpdated: "2026-10-28" },
  { id: "i-006", name: "A4 Paper Ream", sku: "NXR-3008", warehouse: "Dhaka HQ", onHand: 124, reserved: 6, reorderAt: 24, status: "In stock", lastUpdated: "2026-10-25" },
  { id: "i-007", name: "TP-Link Archer AX23", sku: "NXR-3006", warehouse: "Dhaka HQ", onHand: 31, reserved: 1, reorderAt: 10, status: "In stock", lastUpdated: "2026-10-29" },
  { id: "i-008", name: "Jabra Evolve Headset", sku: "NXR-3007", warehouse: "Chittagong", onHand: 14, reserved: 0, reorderAt: 12, status: "In stock", lastUpdated: "2026-10-27" },
];

export type Purchase = {
  id: string;
  date: string;
  supplier: string;
  items: number;
  total: number;
  status: "Received" | "Pending" | "Partially received" | "Cancelled";
  rep: string;
};

export const PURCHASES: Purchase[] = [
  { id: "PO-2026-0286", date: "2026-10-22", supplier: "Global Tech Distributors", items: 48, total: 40000, status: "Received", rep: "Arif Rahman" },
  { id: "PO-2026-0285", date: "2026-10-18", supplier: "Anwar & Brothers", items: 36, total: 32400, status: "Pending", rep: "Farhana Islam" },
  { id: "PO-2026-0284", date: "2026-10-10", supplier: "Metro Electronics", items: 24, total: 58800, status: "Partially received", rep: "Arif Rahman" },
  { id: "PO-2026-0283", date: "2026-10-05", supplier: "Greenfield Supplies", items: 120, total: 19500, status: "Received", rep: "Rafiq Uddin" },
];

export type Invoice = {
  id: string;
  customer: string;
  date: string;
  due: string;
  total: number;
  paid: number;
  status: "Paid" | "Unpaid" | "Overdue" | "Partially paid";
};

export const INVOICES: Invoice[] = [
  { id: "INV-2026-1048", customer: "Bengal Office Co.", date: "2026-10-29", due: "2026-11-29", total: 149625, paid: 0, status: "Unpaid" },
  { id: "INV-2026-1046", customer: "Dhaka Digital Ltd.", date: "2026-10-28", due: "2026-11-28", total: 212100, paid: 120000, status: "Partially paid" },
  { id: "INV-2026-1044", customer: "Northstar Retail", date: "2026-10-27", due: "2026-11-27", total: 64800, paid: 64800, status: "Paid" },
  { id: "INV-2026-1041", customer: "Northstar Retail", date: "2026-10-25", due: "2026-11-25", total: 118500, paid: 118500, status: "Paid" },
  { id: "INV-2026-1042", customer: "Vertex Solutions", date: "2026-10-26", due: "2026-11-26", total: 32200, paid: 0, status: "Overdue" },
];

export type Activity = {
  id: string;
  message: string;
  time: string;
  relative: string;
  actor?: string;
};

export const ACTIVITIES: Activity[] = [
  { id: "a-1", message: "Payment received from Bengal Office Co.", time: "2026-10-29T10:30:00+06:00", relative: "2 hours ago", actor: "Arif Rahman" },
  { id: "a-2", message: "October payroll approved", time: "2026-10-29T09:00:00+06:00", relative: "1 hour ago", actor: "Farhana Islam" },
  { id: "a-3", message: "Stock received at Dhaka Central", time: "2026-10-29T08:45:00+06:00", relative: "12 min ago", actor: "Rafiq Uddin" },
  { id: "a-4", message: "Nusrat created sale SAL-2026-1048", time: "2026-10-29T08:32:00+06:00", relative: "38 min ago", actor: "Nusrat Ahmed" },
];

export type Kpi = {
  id: string;
  label: string;
  value: string;
  change: number;
  prior: string;
  icon: string;
  tone: "primary" | "success" | "warning" | "danger" | "info" | "teal";
};

export const DASHBOARD_KPIS: Kpi[] = [
  { id: "rev", label: "Total Revenue", value: "৳48.6L", change: 18.6, prior: "৳40,97,808 prior", icon: "TrendingUp", tone: "primary" },
  { id: "orders", label: "Total Orders", value: "1,248", change: 16.2, prior: "1,106 prior", icon: "ShoppingCart", tone: "primary" },
  { id: "customers", label: "Active Customers", value: "48", change: 12.8, prior: "", icon: "Users", tone: "primary" },
  { id: "inv", label: "Inventory Value", value: "৳6,84,500", change: -8.1, prior: "৳7,44,831 prior", icon: "Boxes", tone: "warning" },
  { id: "profit", label: "Net Profit", value: "৳31.48L", change: 4.2, prior: "৳31,47,793 prior", icon: "TrendingUp", tone: "success" },
  { id: "expenses", label: "Expenses", value: "৳45,72,000", change: 6.7, prior: "45 prior", icon: "ReceiptText", tone: "teal" },
  { id: "aov", label: "Avg. Order Value", value: "৳3,663", change: 3.0, prior: "৳3,663 prior", icon: "Banknote", tone: "info" },
  { id: "margin", label: "Gross Margin", value: "25.5%", change: 0, prior: "", icon: "Percent", tone: "primary" },
];

export type RevenuePoint = { day: string; date: string; revenue: number; orders: number; previous?: number };
export const REVENUE_SERIES: RevenuePoint[] = [
  { day: "Mon", date: "01 Oct", revenue: 1240000, orders: 86 },
  { day: "Tue", date: "02 Oct", revenue: 1380000, orders: 92 },
  { day: "Wed", date: "03 Oct", revenue: 1190000, orders: 78 },
  { day: "Thu", date: "04 Oct", revenue: 1520000, orders: 101 },
  { day: "Fri", date: "05 Oct", revenue: 1340000, orders: 90 },
  { day: "Sat", date: "06 Oct", revenue: 980000, orders: 65 },
  { day: "Sun", date: "07 Oct", revenue: 910000, orders: 59 },
  { day: "Mon", date: "08 Oct", revenue: 1420000, orders: 95 },
  { day: "Tue", date: "09 Oct", revenue: 1580000, orders: 108 },
  { day: "Wed", date: "10 Oct", revenue: 1360000, orders: 91 },
  { day: "Thu", date: "11 Oct", revenue: 1670000, orders: 112 },
  { day: "Fri", date: "12 Oct", revenue: 1490000, orders: 100 },
  { day: "Sat", date: "13 Oct", revenue: 1020000, orders: 68 },
  { day: "Sun", date: "14 Oct", revenue: 970000, orders: 63 },
  { day: "Mon", date: "15 Oct", revenue: 1510000, orders: 102 },
  { day: "Tue", date: "16 Oct", revenue: 1630000, orders: 110 },
  { day: "Wed", date: "17 Oct", revenue: 1410000, orders: 94 },
  { day: "Thu", date: "18 Oct", revenue: 1720000, orders: 116 },
  { day: "Fri", date: "19 Oct", revenue: 1540000, orders: 104 },
  { day: "Sat", date: "20 Oct", revenue: 1080000, orders: 71 },
  { day: "Sun", date: "21 Oct", revenue: 1010000, orders: 66 },
  { day: "Mon", date: "22 Oct", revenue: 1590000, orders: 107 },
  { day: "Tue", date: "23 Oct", revenue: 1740000, orders: 118 },
  { day: "Wed", date: "24 Oct", revenue: 1620000, orders: 109 },
  { day: "Thu", date: "25 Oct", revenue: 1860000, orders: 126 },
  { day: "Fri", date: "26 Oct", revenue: 1710000, orders: 115 },
  { day: "Sat", date: "27 Oct", revenue: 1190000, orders: 79 },
  { day: "Sun", date: "28 Oct", revenue: 1120000, orders: 74 },
  { day: "Mon", date: "29 Oct", revenue: 1370000, orders: 86 },
];

export type CategoryShare = { name: string; value: number; color: string };
export const REVENUE_BY_CATEGORY: CategoryShare[] = [
  { name: "Electronics", value: 54.2, color: "#6366f1" },
  { name: "Office supplies", value: 21.0, color: "#4f46e5" },
  { name: "Accessories", value: 16.3, color: "#10b981" },
  { name: "Other", value: 8.5, color: "#94a3b8" },
];

export type TopProduct = { id: string; name: string; image: string; units: number };
export const TOP_PRODUCTS: TopProduct[] = [
  { id: "p-005", name: "Anker 65W Charger", image: "/assets/product-anker-compact-white-usb-c-wall-charger.jpg", units: 84 },
  { id: "p-002", name: "Samsung T7 SSD 1TB", image: "/assets/product-samsung-t7-slim-blue-portable-ssd.jpg", units: 44 },
  { id: "p-003", name: "Keychron K2 Pro", image: "/assets/product-keychron-k2-mechanical-keyboard-with-graphite-keycaps.jpg", units: 72 },
  { id: "p-001", name: "Logitech MX Master 3S", image: "/assets/product-graphite-logitech-mx-master-3s-wireless-ergonomic-mouse.jpg", units: 36 },
  { id: "p-004", name: "Dell P2425H Monitor", image: "/assets/product-dell-p2425h-slim-black-desktop-monitor.jpg", units: 96 },
];

export type RecentTransaction = {
  id: string;
  customer: string;
  customerEmail: string;
  amount: number;
  status: "Paid" | "Unpaid" | "Partial";
};
export const RECENT_TRANSACTIONS: RecentTransaction[] = [
  { id: "SAL-2026-1044", customer: "Northstar Retail", customerEmail: "accounts@northstar.com", amount: 64800, status: "Paid" },
  { id: "SAL-2026-1045", customer: "Meghna Enterprise", customerEmail: "payroll@meghna.ltd", amount: 48750, status: "Paid" },
  { id: "SAL-2026-1046", customer: "Dhaka Digital Ltd.", customerEmail: "ops@dhakadigital.com", amount: 212100, status: "Partial" },
  { id: "SAL-2026-1047", customer: "Vertex Solutions", customerEmail: "billing@vertex.io", amount: 86400, status: "Paid" },
  { id: "SAL-2026-1048", customer: "Bengal Office Co.", customerEmail: "hello@bengaloffice.com", amount: 149625, status: "Unpaid" },
];

export type NavSection = { id: string; label: string; items: NavItem[] };
export type NavItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  count?: number;
};
export const NAVIGATION: NavSection[] = [
  {
    id: "workspace",
    label: "WORKSPACE",
    items: [
      { id: "dashboard", label: "Overview", icon: "LayoutDashboard", href: "/", count: 2 },
      { id: "sales", label: "Sales", icon: "ShoppingCart", href: "/sales" },
      { id: "analytics", label: "Analytics", icon: "SquareChartGantt", href: "/analytics" },
    ],
  },
  {
    id: "manage",
    label: "MANAGE",
    items: [
      { id: "inventory", label: "Inventory", icon: "Boxes", href: "/inventory" },
      { id: "products", label: "Products", icon: "Package", href: "/products" },
      { id: "purchases", label: "Purchases", icon: "Truck", href: "/purchases" },
      { id: "customers", label: "Customers / CRM", icon: "Users", href: "/customers" },
      { id: "employees", label: "Employees / HR", icon: "UserRound", href: "/employees" },
    ],
  },
  {
    id: "intelligence",
    label: "INTELLIGENCE",
    items: [
      { id: "reports", label: "Reports", icon: "FileText", href: "/reports" },
      { id: "finance", label: "Finance", icon: "Banknote", href: "/finance" },
      { id: "invoices", label: "Invoices", icon: "ReceiptText", href: "/invoices" },
    ],
  },
  {
    id: "account",
    label: "ACCOUNT",
    items: [
      { id: "profile", label: "Profile", icon: "UserRound", href: "/profile" },
      { id: "settings", label: "Settings", icon: "Settings", href: "/settings" },
    ],
  },
];

export const USER = {
  name: "Md. Nazmus Shakib",
  role: USER_ROLE,
  initials: "NS",
  workspace: "NS ERP / Aster Trading Ltd.",
  avatar: "/user-avatar.jpg",
};

export const CURRENT_DATE = new Date("2026-10-29T13:00:00+06:00");
