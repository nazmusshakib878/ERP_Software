'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  BarChart3, Bell, BriefcaseBusiness, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Download, Edit3, Eye, EyeOff, FileText, Grid2X2, Mail, Sparkles,
  LayoutDashboard, LogOut, Menu, Moon, Package, Plus, RefreshCw, Search,
  Settings, ShoppingCart, Sun, Trash2, TrendingUp, User, UserRound, Users, X,
  ShieldCheck, History, Percent, Sliders, CheckCircle2,
  Building, Building2, Warehouse, Lock, DollarSign, PackageCheck, ShoppingBag,
  ArrowRightLeft, Undo2, ArrowUpRight, CheckCircle, AlertTriangle,
  Calendar, Clock, CreditCard, Wallet, Receipt, Scale, Printer, CheckSquare, FileSpreadsheet
} from 'lucide-react'
import {
  Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { api, setStoredToken, getStoredToken } from './lib/api'

export type Module =
  | 'Dashboard'
  | 'Sales'
  | 'Inventory'
  | 'Products'
  | 'Purchases'
  | 'Customers'
  | 'Employees'
  | 'Finance'
  | 'Analytics'
  | 'Settings'

export type UserRole =
  | 'Company Admin'
  | 'Manager'
  | 'Accountant'
  | 'Staff'
  | 'Employee'
  | 'Super Admin'

export interface SubMenuItem {
  id: string
  label: string
  badge?: string | number
}

export interface NavModuleConfig {
  id: Module
  label: Module
  icon: any
  submenus: SubMenuItem[]
  defaultSubmenu: string
  roles: UserRole[]
}

const navModules: NavModuleConfig[] = [
  {
    id: 'Dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultSubmenu: 'overview',
    roles: ['Company Admin', 'Super Admin', 'Manager', 'Accountant', 'Staff', 'Employee'],
    submenus: [
      { id: 'overview', label: 'Executive Overview' },
      { id: 'sales-kpi', label: 'Sales Dashboard' },
      { id: 'inventory-kpi', label: 'Inventory Dashboard' },
      { id: 'finance-kpi', label: 'Finance Dashboard' },
      { id: 'self-service', label: 'My Self-Service' },
    ],
  },
  {
    id: 'Sales',
    label: 'Sales',
    icon: ShoppingCart,
    defaultSubmenu: 'overview',
    roles: ['Company Admin', 'Super Admin', 'Manager', 'Accountant', 'Staff'],
    submenus: [
      { id: 'overview', label: 'Sales Overview' },
      { id: 'pos', label: 'New Sale / POS' },
      { id: 'orders', label: 'Sales Orders', badge: 'Live' },
      { id: 'quotations', label: 'Quotations' },
      { id: 'invoices', label: 'Invoices' },
      { id: 'payments', label: 'Payments' },
      { id: 'returns', label: 'Sales Returns' },
      { id: 'reports', label: 'Sales Reports' },
    ],
  },
  {
    id: 'Inventory',
    label: 'Inventory',
    icon: Package,
    defaultSubmenu: 'overview',
    roles: ['Company Admin', 'Super Admin', 'Manager', 'Staff'],
    submenus: [
      { id: 'overview', label: 'Inventory Overview' },
      { id: 'current-stock', label: 'Current Stock' },
      { id: 'warehouses', label: 'Warehouse Management' },
      { id: 'stock-history', label: 'Stock In / Out History' },
      { id: 'transfers', label: 'Stock Transfers' },
      { id: 'adjustments', label: 'Stock Adjustments' },
      { id: 'alerts', label: 'Low Stock Alerts', badge: 'Alert' },
      { id: 'reports', label: 'Inventory Reports' },
    ],
  },
  {
    id: 'Products',
    label: 'Products',
    icon: Grid2X2,
    defaultSubmenu: 'catalog',
    roles: ['Company Admin', 'Super Admin', 'Manager', 'Staff'],
    submenus: [
      { id: 'catalog', label: 'Product Catalog' },
      { id: 'add', label: 'Add Product' },
      { id: 'categories', label: 'Product Categories' },
      { id: 'brands', label: 'Brands' },
      { id: 'units', label: 'Units of Measurement' },
      { id: 'pricing', label: 'Pricing Management' },
      { id: 'import-export', label: 'Product Import / Export' },
    ],
  },
  {
    id: 'Purchases',
    label: 'Purchases',
    icon: BriefcaseBusiness,
    defaultSubmenu: 'overview',
    roles: ['Company Admin', 'Super Admin', 'Manager', 'Staff'],
    submenus: [
      { id: 'overview', label: 'Purchase Overview' },
      { id: 'new-po', label: 'New Purchase Order' },
      { id: 'orders', label: 'Purchase Orders' },
      { id: 'suppliers', label: 'Suppliers' },
      { id: 'goods-receiving', label: 'Goods Receiving' },
      { id: 'invoices', label: 'Purchase Invoices' },
      { id: 'payments', label: 'Supplier Payments' },
      { id: 'returns', label: 'Purchase Returns' },
      { id: 'reports', label: 'Purchase Reports' },
    ],
  },
  {
    id: 'Customers',
    label: 'Customers',
    icon: Users,
    defaultSubmenu: 'list',
    roles: ['Company Admin', 'Super Admin', 'Manager', 'Accountant', 'Staff'],
    submenus: [
      { id: 'list', label: 'Customer List' },
      { id: 'add', label: 'Add Customer' },
      { id: 'groups', label: 'Customer Groups' },
      { id: 'ledger', label: 'Customer Ledger' },
      { id: 'payments', label: 'Payment History' },
      { id: 'outstanding', label: 'Outstanding Balances' },
      { id: 'reports', label: 'Customer Reports' },
    ],
  },
  {
    id: 'Employees',
    label: 'Employees',
    icon: UserRound,
    defaultSubmenu: 'directory',
    roles: ['Company Admin', 'Super Admin', 'Manager', 'Staff', 'Employee'],
    submenus: [
      { id: 'directory', label: 'Employee Directory' },
      { id: 'add', label: 'Add Employee' },
      { id: 'departments', label: 'Departments' },
      { id: 'designations', label: 'Designations' },
      { id: 'attendance', label: 'Attendance' },
      { id: 'leaves', label: 'Leave Management' },
      { id: 'payroll', label: 'Payroll & Payslips' },
      { id: 'documents', label: 'Employee Documents' },
      { id: 'reports', label: 'Employee Reports' },
      { id: 'self-service', label: 'Self-Service Portal' },
    ],
  },
  {
    id: 'Finance',
    label: 'Finance',
    icon: FileText,
    defaultSubmenu: 'overview',
    roles: ['Company Admin', 'Super Admin', 'Manager', 'Accountant'],
    submenus: [
      { id: 'overview', label: 'Finance Overview' },
      { id: 'income', label: 'Income' },
      { id: 'expenses', label: 'Expenses' },
      { id: 'receivable', label: 'Accounts Receivable' },
      { id: 'payable', label: 'Accounts Payable' },
      { id: 'bank-accounts', label: 'Cash & Bank Accounts' },
      { id: 'transactions', label: 'Transactions' },
      { id: 'general-ledger', label: 'General Ledger' },
      { id: 'profit-loss', label: 'Profit & Loss' },
      { id: 'balance-sheet', label: 'Balance Sheet' },
      { id: 'reports', label: 'Financial Reports' },
    ],
  },
  {
    id: 'Analytics',
    label: 'Analytics',
    icon: BarChart3,
    defaultSubmenu: 'business',
    roles: ['Company Admin', 'Super Admin', 'Manager', 'Accountant'],
    submenus: [
      { id: 'business', label: 'Business Analytics' },
      { id: 'sales', label: 'Sales Analytics' },
      { id: 'products', label: 'Product Performance' },
      { id: 'customers', label: 'Customer Analytics' },
      { id: 'purchases', label: 'Purchase Analytics' },
      { id: 'inventory', label: 'Inventory Analytics' },
      { id: 'financial', label: 'Financial Analytics' },
      { id: 'custom', label: 'Custom Reports' },
    ],
  },
  {
    id: 'Settings',
    label: 'Settings',
    icon: Settings,
    defaultSubmenu: 'company',
    roles: ['Company Admin', 'Super Admin', 'Manager'],
    submenus: [
      { id: 'company', label: 'Company Profile' },
      { id: 'users-roles', label: 'Users & Roles' },
      { id: 'permissions', label: 'Permissions' },
      { id: 'warehouses', label: 'Warehouses' },
      { id: 'currency', label: 'Currency & Localization' },
      { id: 'taxes', label: 'Tax Settings' },
      { id: 'invoice-settings', label: 'Invoice Settings' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'security', label: 'Security' },
      { id: 'audit-logs', label: 'Audit Logs' },
      { id: 'preferences', label: 'System Preferences' },
    ],
  },
]

// Yearly monthly datasets
const fullYearData = [
  { label: 'Jan', revenue: 3800000, orders: 120 },
  { label: 'Feb', revenue: 4200000, orders: 148 },
  { label: 'Mar', revenue: 3900000, orders: 132 },
  { label: 'Apr', revenue: 5100000, orders: 176 },
  { label: 'May', revenue: 4700000, orders: 162 },
  { label: 'Jun', revenue: 6100000, orders: 208 },
  { label: 'Jul', revenue: 5800000, orders: 194 },
  { label: 'Aug', revenue: 6900000, orders: 236 },
  { label: 'Sep', revenue: 7300000, orders: 254 },
  { label: 'Oct', revenue: 8200000, orders: 281 },
  { label: 'Nov', revenue: 7600000, orders: 266 },
  { label: 'Dec', revenue: 9100000, orders: 310 },
]

const sixMonthsData = [
  { label: 'May', revenue: 4700000, orders: 162 },
  { label: 'Jun', revenue: 6100000, orders: 208 },
  { label: 'Jul', revenue: 5800000, orders: 194 },
  { label: 'Aug', revenue: 6900000, orders: 236 },
  { label: 'Sep', revenue: 7300000, orders: 254 },
  { label: 'Oct', revenue: 8200000, orders: 281 },
]

const chartColors = ['#6c63ff', '#00b894', '#f59e0b', '#ef476f']

function StatusBadge({ children }: { children: string }) {
  const tone = (children || '').toLowerCase().replaceAll(' ', '-').replaceAll('_', '-')
  return <span className={`badge badge-${tone}`}>{children}</span>
}

function StatCard({ title, value, change, icon: Icon, tone }: { title: string; value: string | number; change: string | number; icon: typeof TrendingUp; tone: string }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={20} /></div>
      <div className="stat-copy">
        <span>{title}</span>
        <strong>{value}</strong>
        <small className="positive">↗ {change}% <em>vs last month</em></small>
      </div>
    </div>
  )
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <Check size={16} /> : <X size={16} />}
      <span>{message}</span>
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState<Module>('Dashboard')
  const [activeSubmenu, setActiveSubmenu] = useState<string>('overview')
  const [currentRole, setCurrentRole] = useState<UserRole>('Company Admin')
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    Dashboard: true,
    Sales: false,
    Inventory: false,
    Products: false,
    Purchases: false,
    Customers: false,
    Employees: false,
    Finance: false,
    Analytics: false,
    Settings: false,
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [user, setUser] = useState<{
    id: string
    name: string
    email: string
    role: string
    initials: string
    workspace: string
    avatar?: string
    allowed_modules?: string[]
    permissions?: string[]
  }>({
    id: '1',
    name: 'Md. Nazmus Shakib',
    email: 'shakib@nserp.com',
    role: 'Company Admin',
    initials: 'NS',
    workspace: 'NS ERP / Aster Trading Ltd.',
    avatar: '/user-avatar.jpg',
    allowed_modules: ['Dashboard', 'Sales', 'Inventory', 'Products', 'Purchases', 'Customers', 'Employees', 'Finance', 'Analytics', 'Settings'],
    permissions: ['all'],
  })
  const [apiConnected, setApiConnected] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const visibleModules = useMemo(() => {
    return navModules.filter((m) => {
      if (!m.roles.includes(currentRole)) return false
      if (currentRole === 'Staff' && user.allowed_modules && Array.isArray(user.allowed_modules)) {
        return user.allowed_modules.includes(m.id)
      }
      return true
    })
  }, [currentRole, user.allowed_modules])

  const activeSubmenuLabel = useMemo(() => {
    const currentMod = navModules.find((m) => m.id === active)
    const sub = currentMod?.submenus.find((s) => s.id === activeSubmenu)
    return sub?.label || active
  }, [active, activeSubmenu])

  // Topbar dropdown states
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [globalQuery, setGlobalQuery] = useState('')
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)

  // Compute initials fallback dynamically
  const userInitials = useMemo(() => {
    if (user.initials) return user.initials
    if (user.name) {
      const parts = user.name.trim().split(/\s+/)
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      return user.name.slice(0, 2).toUpperCase()
    }
    return 'NS'
  }, [user.initials, user.name])

  // Notification items
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; desc: string; time: string; read: boolean }>>([
    { id: '1', title: 'Payment Received', desc: 'Received ৳149,625 for invoice INV-2026-1048', time: '10 min ago', read: false },
    { id: '2', title: 'New Sale Order', desc: 'SAL-2026-1048 for Bengal Office Co. recorded', time: '35 min ago', read: false },
    { id: '3', title: 'Stock Alert', desc: 'Dell P2425H Monitor is low on stock (4 units)', time: '2 hours ago', read: false },
    { id: '4', title: 'October Payroll', desc: 'Payroll approved by Farhana Islam', time: '4 hours ago', read: true },
  ])

  // Data states
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [productsList, setProductsList] = useState<any[]>([])
  const [customersList, setCustomersList] = useState<any[]>([])
  const [salesList, setSalesList] = useState<any[]>([])
  const [employeesList, setEmployeesList] = useState<any[]>([])
  const [purchasesList, setPurchasesList] = useState<any[]>([])
  const [invoicesList, setInvoicesList] = useState<any[]>([])
  const [settingsData, setSettingsData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setGlobalSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Ctrl+K keyboard shortcut to focus global search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        setGlobalSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Restore active module and submenu from localStorage or URL query/hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlMod = (params.get('module') || window.location.hash.replace('#', '')) as Module
      const urlSub = params.get('tab') || params.get('submenu')

      const savedMod = (urlMod && navModules.some((m) => m.id === urlMod))
        ? urlMod
        : (localStorage.getItem('ns_erp_active_module') as Module | null)
      const savedSub = urlSub || localStorage.getItem('ns_erp_active_submenu')

      if (savedMod && navModules.some((m) => m.id === savedMod)) {
        setActive(savedMod)
        setExpandedModules((prev) => ({ ...prev, [savedMod]: true }))
        if (savedSub) {
          const modDef = navModules.find((m) => m.id === savedMod)
          if (modDef?.submenus.some((s) => s.id === savedSub)) {
            setActiveSubmenu(savedSub)
          }
        }
      }
    }
  }, [])

  // Persist active navigation state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ns_erp_active_module', active)
      localStorage.setItem('ns_erp_active_submenu', activeSubmenu)
    }
  }, [active, activeSubmenu])

  // Check auth & fetch user info
  useEffect(() => {
    const token = getStoredToken()
    if (token) {
      api.auth.me().then(res => {
        if (res.user) {
          setUser(res.user)
          if (res.user.role) {
            setCurrentRole(res.user.role as UserRole)
          }
          setLoggedIn(true)
        } else {
          setStoredToken(null)
          setLoggedIn(false)
        }
      }).catch(() => {
        setStoredToken(null)
        setLoggedIn(false)
      }).finally(() => {
        setAuthChecking(false)
      })
    } else {
      setLoggedIn(false)
      setAuthChecking(false)
    }
  }, [])

  // Load active module data
  const loadModuleData = useCallback(async () => {
    try {
      setLoading(true)
      if (active === 'Dashboard' || active === 'Analytics') {
        const stats = await api.dashboard.stats()
        setDashboardStats(stats)
        setApiConnected(true)
      } else if (active === 'Products' || active === 'Inventory') {
        const prods = await api.products.list()
        setProductsList(prods)
        setApiConnected(true)
      } else if (active === 'Customers') {
        const custs = await api.customers.list()
        setCustomersList(custs)
        setApiConnected(true)
      } else if (active === 'Sales') {
        const sales = await api.sales.list()
        setSalesList(sales)
        setApiConnected(true)
      } else if (active === 'Employees') {
        const emps = await api.employees.list()
        setEmployeesList(emps)
        setApiConnected(true)
      } else if (active === 'Purchases') {
        const pos = await api.purchases.list()
        setPurchasesList(pos)
        setApiConnected(true)
      } else if (active === 'Finance') {
        const invs = await api.invoices.list()
        setInvoicesList(invs)
        setApiConnected(true)
      } else if (active === 'Settings') {
        const conf = await api.settings.get()
        setSettingsData(conf)
        setApiConnected(true)
      }
    } catch {
      setApiConnected(false)
    } finally {
      setLoading(false)
    }
  }, [active])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadModuleData()
      showToast('System data refreshed from Laravel API!')
    } catch {
      showToast('Refresh failed', 'error')
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    showToast('All notifications marked as read')
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (loggedIn) {
      /* oxlint-disable-next-line react/set-state-in-effect */
      loadModuleData()
    }
  }, [active, loggedIn, loadModuleData])

  const handleLogout = async () => {
    try {
      await api.auth.logout()
    } catch {}
    setStoredToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ns_erp_active_module')
      localStorage.removeItem('ns_erp_active_submenu')
    }
    setLoggedIn(false)
  }

  // Global search filtering across modules
  const globalSearchResults = useMemo(() => {
    if (!globalQuery.trim()) return null
    const q = globalQuery.toLowerCase()
    const prods = productsList.filter(p => `${p.name} ${p.sku}`.toLowerCase().includes(q)).slice(0, 3)
    const custs = customersList.filter(c => `${c.name} ${c.company}`.toLowerCase().includes(q)).slice(0, 3)
    const sales = salesList.filter(s => `${s.order_number} ${s.customer_name}`.toLowerCase().includes(q)).slice(0, 3)
    const emps = employeesList.filter(e => `${e.name} ${e.role}`.toLowerCase().includes(q)).slice(0, 3)
    return { prods, custs, sales, emps }
  }, [globalQuery, productsList, customersList, salesList, employeesList])

  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--app-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-mark" style={{ width: 44, height: 44, fontSize: 18, margin: '0 auto 16px' }}>NS</div>
          <div style={{ fontSize: 13, color: 'var(--app-muted)', fontWeight: 500 }}>Connecting to NS ERP workspace...</div>
        </div>
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <Login
        onLogin={(loggedInUser) => {
          setUser(loggedInUser)
          if (loggedInUser.role) {
            setCurrentRole(loggedInUser.role as UserRole)
          }
          setLoggedIn(true)
          showToast(`Welcome back, ${loggedInUser.name}!`)
        }}
      />
    )
  }

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">NS</span>
          <span>NS ERP</span>
        </div>

        <div className="workspace-switch" onClick={() => setShowWorkspaceModal(true)} style={{ cursor: 'pointer' }} title="Authorized company workspace">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="workspace-avatar" />
          ) : (
            <span className="workspace-avatar">{userInitials}</span>
          )}
          <span>
            <b>{user.workspace || 'NS ERP / Aster Trading Ltd.'}</b>
            <small>{user.role}</small>
          </span>
          <ChevronDown size={14} />
        </div>

        <nav>
          <p className="nav-label">MAIN MENU</p>
          {visibleModules.map((mod) => {
            const Icon = mod.icon
            const isMainActive = active === mod.id
            const isExpanded = expandedModules[mod.id] !== undefined
              ? !!expandedModules[mod.id]
              : isMainActive

            return (
              <div key={mod.id} className="nav-group">
                <button
                  type="button"
                  className={`nav-main-button ${isMainActive ? 'active' : ''}`}
                  aria-expanded={isExpanded}
                  aria-controls={`submenu-${mod.id}`}
                  onClick={() => {
                    const nextExpanded = !isExpanded
                    setExpandedModules((prev) => ({
                      ...prev,
                      [mod.id]: nextExpanded,
                    }))
                    if (!isMainActive) {
                      setActive(mod.id)
                      setActiveSubmenu(mod.defaultSubmenu)
                    }
                  }}
                >
                  <div className="nav-main-left">
                    <Icon size={17} />
                    <span>{mod.label}</span>
                  </div>
                  <ChevronDown size={14} className={`nav-chevron ${isExpanded ? 'open' : ''}`} />
                </button>

                {isExpanded && (
                  <div id={`submenu-${mod.id}`} className="submenu-list">
                    {mod.submenus.map((sub) => {
                      const isSubActive = isMainActive && activeSubmenu === sub.id
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          className={`submenu-button ${isSubActive ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setActive(mod.id)
                            setActiveSubmenu(sub.id)
                            setExpandedModules((prev) => ({
                              ...prev,
                              [mod.id]: true,
                            }))
                            setSidebarOpen(false)
                          }}
                        >
                          <span>{sub.label}</span>
                          {sub.badge && <span className="nav-count">{sub.badge}</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          <p className="nav-label">SESSION</p>
          <button onClick={handleLogout} className="nav-main-button">
            <div className="nav-main-left">
              <LogOut size={17} />
              <span>Sign out</span>
            </div>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card" onClick={() => setShowHelpModal(true)} style={{ cursor: 'pointer' }} title="Click for Help & Documentation">
            <CircleHelp size={18} />
            <div>
              <b>Need help?</b>
              <small>Documentation & Guide</small>
            </div>
            <ChevronRight size={15} />
          </div>
          <small className="version">NS ERP v2.0 · Enterprise Suite</small>
        </div>
      </aside>

      <div className="mobile-backdrop" onClick={() => setSidebarOpen(false)} />

      <main className="main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setSidebarOpen(true)}>
            <Menu size={21} />
          </button>

          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight size={13} />
            <span>{active}</span>
            <ChevronRight size={13} />
            <b>{activeSubmenuLabel}</b>
          </div>

          <div className="top-actions">
            {/* Live API connection pill */}
            <div className={`api-status-badge ${apiConnected ? '' : 'offline'}`} title="Laravel Backend API Status">
              <span className={`api-status-dot ${apiConnected ? '' : 'offline'}`} />
              <span>{apiConnected ? 'Laravel API Connected' : 'Offline Mode (Local Cache)'}</span>
            </div>

            {/* Global Search with Dropdown Results */}
            <div className="global-search relative-box" ref={searchRef}>
              <Search size={17} />
              <input
                ref={searchInputRef}
                placeholder="Search anything (Ctrl+K)..."
                value={globalQuery}
                onFocus={() => setGlobalSearchOpen(true)}
                onChange={(e) => {
                  setGlobalQuery(e.target.value)
                  setGlobalSearchOpen(true)
                }}
              />
              <kbd>⌘ K</kbd>

              {globalSearchOpen && globalSearchResults && (
                <div className="global-search-results">
                  {globalSearchResults.prods.length > 0 && (
                    <div>
                      <div className="search-group-title">Products</div>
                      {globalSearchResults.prods.map(p => (
                        <div key={p.id} className="search-result-item" onClick={() => { setActive('Products'); setGlobalSearchOpen(false); }}>
                          <span>{p.name} ({p.sku})</span>
                          <b>৳{Number(p.price).toLocaleString()}</b>
                        </div>
                      ))}
                    </div>
                  )}

                  {globalSearchResults.custs.length > 0 && (
                    <div>
                      <div className="search-group-title">Customers</div>
                      {globalSearchResults.custs.map(c => (
                        <div key={c.id} className="search-result-item" onClick={() => { setActive('Customers'); setGlobalSearchOpen(false); }}>
                          <span>{c.name}</span>
                          <small className="muted">{c.company}</small>
                        </div>
                      ))}
                    </div>
                  )}

                  {globalSearchResults.sales.length > 0 && (
                    <div>
                      <div className="search-group-title">Orders</div>
                      {globalSearchResults.sales.map(s => (
                        <div key={s.id} className="search-result-item" onClick={() => { setActive('Sales'); setGlobalSearchOpen(false); }}>
                          <span>{s.order_number} · {s.customer_name}</span>
                          <b>৳{Number(s.total).toLocaleString()}</b>
                        </div>
                      ))}
                    </div>
                  )}

                  {globalSearchResults.emps.length > 0 && (
                    <div>
                      <div className="search-group-title">Employees</div>
                      {globalSearchResults.emps.map(e => (
                        <div key={e.id} className="search-result-item" onClick={() => { setActive('Employees'); setGlobalSearchOpen(false); }}>
                          <span>{e.name}</span>
                          <small className="muted">{e.role}</small>
                        </div>
                      ))}
                    </div>
                  )}

                  {!globalSearchResults.prods.length && !globalSearchResults.custs.length && !globalSearchResults.sales.length && !globalSearchResults.emps.length && (
                    <div style={{ padding: '14px', textAlign: 'center', color: 'var(--app-muted)', fontSize: 11 }}>
                      No matching records found.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              className="icon-button"
              onClick={handleRefresh}
              title="Synchronize and refresh data from Laravel API"
            >
              <RefreshCw size={16} className={isRefreshing || loading ? 'animate-spin' : ''} />
            </button>

            {/* Notifications Dropdown */}
            <div className="relative-box" ref={notifRef}>
              <button
                className="icon-button notification"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen)
                  setProfileMenuOpen(false)
                }}
                title="Notifications"
              >
                <Bell size={18} />
                {notifications.some((n) => !n.read) && <i />}
              </button>

              {notificationsOpen && (
                <div className="top-dropdown">
                  <div className="dropdown-header">
                    <h3>Notifications</h3>
                    <button onClick={markAllNotificationsRead}>Mark all read</button>
                  </div>
                  <div className="notifications-list">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notification-item ${n.read ? '' : 'unread'}`}
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                          )
                        }}
                      >
                        <div className="notification-icon-box">
                          <Bell size={14} />
                        </div>
                        <div className="notification-content">
                          <b>{n.title}</b>
                          <p style={{ margin: '3px 0', color: 'var(--app-muted)' }}>{n.desc}</p>
                          <small>{n.time}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Professional Authenticated Account Menu */}
            <div className="account-dropdown-wrapper relative-box" ref={profileRef}>
              <button
                type="button"
                className="account-pill-button"
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen)
                  setNotificationsOpen(false)
                }}
                aria-expanded={profileMenuOpen}
                title="User account & session settings"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="account-avatar" />
                ) : (
                  <span className="account-avatar-fallback">{userInitials}</span>
                )}
                <div className="account-pill-text">
                  <span className="account-name">{user.name}</span>
                  <span className="account-role">{user.role}</span>
                </div>
                <ChevronDown size={14} className={`account-chevron ${profileMenuOpen ? 'open' : ''}`} />
              </button>

              {profileMenuOpen && (
                <div className="top-dropdown profile-menu account-menu-popup">
                  <div className="profile-menu-header">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="avatar" style={{ width: 38, height: 38 }} />
                    ) : (
                      <span className="avatar" style={{ width: 38, height: 38, fontSize: 13 }}>{userInitials}</span>
                    )}
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                      <b style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.name}</b>
                      <small style={{ color: 'var(--app-muted)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.email}</small>
                      <span className="badge badge-active" style={{ marginTop: 4, display: 'inline-block', fontSize: 9 }}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setShowProfileModal(true)
                      setProfileMenuOpen(false)
                    }}
                  >
                    <User size={15} />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setActive('Settings')
                      setActiveSubmenu('security')
                      setProfileMenuOpen(false)
                    }}
                  >
                    <Settings size={15} />
                    <span>Account Settings</span>
                  </button>

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setShowWorkspaceModal(true)
                      setProfileMenuOpen(false)
                    }}
                  >
                    <Building2 size={15} />
                    <span>Switch Workspace</span>
                  </button>

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setDarkMode(!darkMode)
                      setProfileMenuOpen(false)
                      showToast(`Appearance switched to ${!darkMode ? 'Dark' : 'Light'} mode`)
                    }}
                  >
                    {darkMode ? <Sun size={15} /> : <Moon size={15} />}
                    <span>{darkMode ? 'Light appearance' : 'Dark appearance'}</span>
                  </button>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-item danger"
                    onClick={() => {
                      setProfileMenuOpen(false)
                      handleLogout()
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {showProfileModal && (
          <ProfileDetailsModal user={user} onClose={() => setShowProfileModal(false)} />
        )}

        {showWorkspaceModal && (
          <WorkspaceSwitcherModal
            user={user}
            onClose={() => setShowWorkspaceModal(false)}
            showToast={showToast}
          />
        )}

        {showHelpModal && (
          <HelpDocumentationModal onClose={() => setShowHelpModal(false)} />
        )}

        {active === 'Dashboard' && (
          <DashboardView
            stats={dashboardStats}
            onNavigate={(mod) => setActive(mod)}
            onOrderCreated={loadModuleData}
            showToast={showToast}
          />
        )}

        {active === 'Sales' && (
          <SalesView
            sales={salesList}
            products={productsList}
            activeSubmenu={activeSubmenu}
            onRefresh={loadModuleData}
            showToast={showToast}
          />
        )}

        {active === 'Products' && (
          <ProductsView
            products={productsList}
            onRefresh={loadModuleData}
            showToast={showToast}
          />
        )}

        {active === 'Inventory' && (
          <InventoryView
            products={productsList}
            activeSubmenu={activeSubmenu}
            onRefresh={loadModuleData}
            showToast={showToast}
          />
        )}

        {active === 'Purchases' && (
          <PurchasesView
            purchases={purchasesList}
            products={productsList}
            activeSubmenu={activeSubmenu}
            onRefresh={loadModuleData}
            showToast={showToast}
          />
        )}

        {active === 'Customers' && (
          <CustomersView
            customers={customersList}
            onRefresh={loadModuleData}
            showToast={showToast}
          />
        )}

        {active === 'Employees' && (
          <EmployeesView
            employees={employeesList}
            activeSubmenu={activeSubmenu}
            onSelectSubmenu={(sub) => setActiveSubmenu(sub)}
            onRefresh={loadModuleData}
            showToast={showToast}
          />
        )}

        {active === 'Finance' && (
          <FinanceView
            invoices={invoicesList}
            activeSubmenu={activeSubmenu}
            onSelectSubmenu={(sub) => setActiveSubmenu(sub)}
            onRefresh={loadModuleData}
            showToast={showToast}
          />
        )}

        {active === 'Analytics' && (
          <AnalyticsView stats={dashboardStats} showToast={showToast} />
        )}

        {active === 'Settings' && (
          <SettingsView
            settings={settingsData}
            activeSubmenu={activeSubmenu}
            onSelectSubmenu={(sub) => setActiveSubmenu(sub)}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  )
}

/* ========================================================================= */
/* DASHBOARD VIEW (FULLY INTERACTIVE WITH TIMEFRAMES & DUAL SERIES)         */
/* ========================================================================= */

function DashboardView({
  stats,
  onNavigate,
  onOrderCreated,
  showToast,
}: {
  stats: any
  onNavigate: (m: Module) => void
  onOrderCreated: () => void
  showToast: (msg: string, t?: 'success' | 'error') => void
}) {
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [timeframe, setTimeframe] = useState<'October 2026' | 'Full Year 2026' | 'Last 6 Months'>('October 2026')
  const [showRevenue, setShowRevenue] = useState(true)
  const [showOrders, setShowOrders] = useState(true)
  const [channelView, setChannelView] = useState<'donut' | 'bars'>('donut')

  const kpis = stats?.kpis || [
    { id: 'rev', label: 'Total Revenue', value: '৳48.6L', change: 18.6, icon: TrendingUp, tone: 'purple' },
    { id: 'orders', label: 'Total Orders', value: '1,248', change: 16.2, icon: ShoppingCart, tone: 'blue' },
    { id: 'customers', label: 'Active Customers', value: '48', change: 12.8, icon: Users, tone: 'green' },
    { id: 'profit', label: 'Net Profit', value: '৳31.48L', change: 10.6, icon: BarChart3, tone: 'orange' },
  ]
  const recentOrders = stats?.recent_orders || []

  // Switch chart data based on timeframe selection
  const chartData = useMemo(() => {
    if (timeframe === 'Full Year 2026') return fullYearData
    if (timeframe === 'Last 6 Months') return sixMonthsData
    if (stats?.revenue_series && stats.revenue_series.length > 0) {
      return stats.revenue_series.map((item: any) => ({
        ...item,
        label: item.date || item.day,
      }))
    }
    return fullYearData
  }, [timeframe, stats])

  const channelData = [
    { name: 'Direct', value: 42, amount: 204120 },
    { name: 'Online', value: 28, amount: 136080 },
    { name: 'Partners', value: 18, amount: 87480 },
    { name: 'Other', value: 12, amount: 58320 },
  ]

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Friday, October 30, 2026 · NS ERP Live</p>
          <h1>Executive Dashboard <span>✦</span></h1>
          <p className="muted">Real-time overview of business operations, sales, and inventory.</p>
        </div>
        <button className="button primary" onClick={() => setShowOrderModal(true)}>
          <Plus size={17} /> Create new order
        </button>
      </div>

      <div className="stat-grid">
        {kpis.slice(0, 4).map((kpi: any) => (
          <StatCard
            key={kpi.id}
            title={kpi.label}
            value={kpi.value}
            change={kpi.change}
            icon={kpi.tone === 'purple' ? TrendingUp : kpi.tone === 'blue' ? ShoppingCart : kpi.tone === 'green' ? Users : BarChart3}
            tone={kpi.tone}
          />
        ))}
      </div>

      <div className="two-col">
        {/* REVENUE OVERVIEW CARD WITH WORKING TIMEFRAME SELECTOR & WORKING LEGEND */}
        <section className="card chart-card">
          <div className="card-heading">
            <div>
              <h2>Revenue overview</h2>
              <p className="muted">
                {timeframe === 'Full Year 2026' ? 'Annual 12-month performance (Jan - Dec 2026)' : timeframe === 'Last 6 Months' ? 'Last 6 months performance (May - Oct 2026)' : 'Daily revenue trajectory for October 2026'}
              </p>
            </div>
            <select
              value={timeframe}
              onChange={(e) => {
                const val = e.target.value as any
                setTimeframe(val)
                showToast(`Switched chart view to ${val}`)
              }}
            >
              <option value="October 2026">October 2026</option>
              <option value="Full Year 2026">Full Year 2026</option>
              <option value="Last 6 Months">Last 6 Months</option>
            </select>
          </div>

          {/* Interactive clickable legend to toggle Revenue or Orders */}
          <div className="chart-legend" style={{ gap: 8 }}>
            <button
              className={`legend-button ${showRevenue ? '' : 'inactive'}`}
              onClick={() => setShowRevenue(!showRevenue)}
              title="Click to toggle Revenue line"
            >
              <i className="dot purple-dot" />
              <span>Revenue (৳)</span>
            </button>
            <button
              className={`legend-button ${showOrders ? '' : 'inactive'}`}
              onClick={() => setShowOrders(!showOrders)}
              title="Click to toggle Orders line"
            >
              <i className="dot blue-dot" />
              <span>Orders (Count)</span>
            </button>
          </div>

          <div className="chart">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c63ff" stopOpacity=".28" />
                    <stop offset="100%" stopColor="#6c63ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef0f5" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9299a8', fontSize: 11 }}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9299a8', fontSize: 11 }}
                  tickFormatter={(v) => `৳${v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${v / 1000}k`}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#3986e8', fontSize: 11 }}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === 'Orders') return [`${value} orders`, 'Orders Volume']
                    return [`৳${Number(value).toLocaleString()}`, 'Total Revenue']
                  }}
                />
                {showRevenue && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#6c63ff"
                    strokeWidth={3}
                    fill="url(#revenue)"
                  />
                )}
                {showOrders && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#3986e8"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#3986e8' }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* SALES BY CHANNEL CARD */}
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>Sales by channel</h2>
              <p className="muted">Distribution across marketing channels</p>
            </div>
            <button
              className="icon-button"
              onClick={() => {
                setChannelView(v => v === 'donut' ? 'bars' : 'donut')
                showToast(`Switched to ${channelView === 'donut' ? 'Bar view' : 'Donut view'}`)
              }}
              title="Toggle Donut / Bar breakdown"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="donut-wrap">
            <ResponsiveContainer width="58%" height={200}>
              {channelView === 'donut' ? (
                <PieChart>
                  <Pie data={channelData} innerRadius={62} outerRadius={82} dataKey="value" stroke="none">
                    {channelData.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v}%`, 'Share']} />
                </PieChart>
              ) : (
                <BarChart data={channelData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Bar dataKey="value" fill="#6c63ff" radius={[0, 4, 4, 0]}>
                    {channelData.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>

            {channelView === 'donut' && (
              <div className="donut-total">
                <strong>100%</strong>
                <span>Channels</span>
              </div>
            )}

            <div className="channel-list">
              {channelData.map((item, i) => (
                <div key={item.name}>
                  <span><i className="dot" style={{ background: chartColors[i] }} />{item.name}</span>
                  <b>{item.value}%</b>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="card table-card">
        <div className="card-heading">
          <div>
            <h2>Recent orders</h2>
            <p className="muted">Live updates synced directly from Laravel SQLite database</p>
          </div>
          <button className="text-button" onClick={() => onNavigate('Sales')}>
            View all orders <ChevronRight size={15} />
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((row: any) => (
                  <tr key={row.id}>
                    <td className="strong">{row.order_number || row.id}</td>
                    <td>{row.customer_name || row.customer}</td>
                    <td className="muted">{row.date}</td>
                    <td className="strong">৳{Number(row.total || row.amount || 0).toLocaleString()}</td>
                    <td><StatusBadge>{row.status}</StatusBadge></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-state">No recent orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showOrderModal && (
        <CreateOrderModal
          onClose={() => setShowOrderModal(false)}
          onSuccess={() => {
            setShowOrderModal(false)
            onOrderCreated()
            showToast('New sale order created and stock updated!')
          }}
        />
      )}
    </div>
  )
}

/* ========================================================================= */
/* SALES VIEW (WITH WORKING STATUS TABS, PAYMENT FILTER, PAGINATION, DETAILS)*/
/* ========================================================================= */

function SalesView({
  sales,
  products = [],
  activeSubmenu = 'overview',
  onRefresh,
  showToast,
}: {
  sales: any[]
  products?: any[]
  activeSubmenu?: string
  onRefresh: () => void
  showToast: (m: string, t?: 'success' | 'error') => void
}) {
  const [query, setQuery] = useState('')
  const [statusTab, setStatusTab] = useState<'All' | 'Paid' | 'Unpaid' | 'Partial' | 'Overdue' | 'Returned'>('All')
  const [methodFilter, setMethodFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [returningSale, setReturningSale] = useState<any>(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quotations, setQuotations] = useState<any[]>([
    {
      id: 1,
      quote_number: 'QT-2026-001',
      customer_name: 'Beximco Pharmaceuticals Ltd.',
      customer_email: 'procurement@beximco.com',
      product_name: 'Dell P2425H Monitor',
      price: 18500,
      quantity: 5,
      total: 106375,
      valid_until: '15 days',
      status: 'Sent',
      date: '2026-10-28',
    },
    {
      id: 2,
      quote_number: 'QT-2026-002',
      customer_name: 'Grameenphone Corporate HQ',
      customer_email: 'supply@grameenphone.com',
      product_name: 'TP-Link Archer AX23',
      price: 5200,
      quantity: 10,
      total: 59800,
      valid_until: '30 days',
      status: 'Accepted',
      date: '2026-10-29',
    },
  ])
  const pageSize = 6

  const handleConvertQuote = async (quote: any) => {
    try {
      await api.sales.create({
        customer_name: quote.customer_name,
        customer_email: quote.customer_email,
        payment_method: 'Bank transfer',
        status: 'Unpaid',
        items: [
          {
            product_name: quote.product_name,
            price: quote.price,
            quantity: quote.quantity,
          },
        ],
        notes: `Converted from Quotation ${quote.quote_number}`,
      })
      await api.auditLogs.create({
        action: 'Quotation Converted',
        module: 'Sales',
        record_reference: quote.quote_number,
        details: `Quotation ${quote.quote_number} for ${quote.customer_name} converted into active Sales Order.`,
      })
      setQuotations(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'Converted' } : q))
      showToast(`Quotation ${quote.quote_number} converted to active sales order!`)
      onRefresh()
    } catch (err: any) {
      showToast(err.message || 'Failed to convert quotation', 'error')
    }
  }

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const matchQuery = `${s.order_number} ${s.customer_name} ${s.status} ${s.payment_method}`.toLowerCase().includes(query.toLowerCase())
      const matchStatus = activeSubmenu === 'returns' ? s.status === 'Returned' : (statusTab === 'All' || s.status === statusTab)
      const matchMethod = methodFilter === 'All' || s.payment_method === methodFilter
      return matchQuery && matchStatus && matchMethod
    })
  }, [sales, query, statusTab, methodFilter, activeSubmenu])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return
    try {
      await api.sales.delete(id)
      showToast('Order deleted successfully')
      onRefresh()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleMarkPaid = async (id: number) => {
    try {
      await api.sales.update(id, { status: 'Paid' })
      showToast('Order status marked as Paid')
      onRefresh()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Workspace / Sales</p>
          <h1>{activeSubmenu === 'quotations' ? 'Price Quotations & Proposals' : (activeSubmenu === 'returns' ? 'Sales Returns & Restocking' : 'Sales & Orders')}</h1>
          <p className="muted">Manage customer transactions, quotations, returns, and POS receipts.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {activeSubmenu === 'quotations' ? (
            <button className="button primary" onClick={() => setShowQuoteModal(true)}>
              <Plus size={17} /> Create Quotation
            </button>
          ) : (
            <button className="button primary" onClick={() => setShowModal(true)}>
              <Plus size={17} /> Create new order
            </button>
          )}
        </div>
      </div>

      <div className="card toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            placeholder="Search orders..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        <select
          className="filter-select"
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value)
            setCurrentPage(1)
          }}
        >
          <option value="All">All Payment Methods</option>
          <option value="Bank transfer">Bank transfer</option>
          <option value="bKash">bKash</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
        </select>

        <div className="tabs">
          {(['All', 'Paid', 'Unpaid', 'Partial', 'Overdue'] as const).map(tab => (
            <button
              key={tab}
              className={statusTab === tab ? 'active' : ''}
              onClick={() => {
                setStatusTab(tab)
                setCurrentPage(1)
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeSubmenu === 'quotations' ? (
        <section className="card table-card">
          <div className="card-heading">
            <div>
              <h2>Price Quotations & Proposals ({quotations.length})</h2>
              <p className="muted">Formal commercial proposals with direct sales order conversion.</p>
            </div>
            <button className="button primary" onClick={() => setShowQuoteModal(true)}>
              <Plus size={15} /> Create Quotation
            </button>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Quote Number</th>
                  <th>Prospective Client</th>
                  <th>Product / Service</th>
                  <th>Validity</th>
                  <th>Total (inc. VAT)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((q) => (
                  <tr key={q.id}>
                    <td className="strong">{q.quote_number}</td>
                    <td><b>{q.customer_name}</b></td>
                    <td>{q.product_name}</td>
                    <td>{q.valid_until}</td>
                    <td className="strong">৳{Number(q.total).toLocaleString()}</td>
                    <td>
                      <span className="code-badge" style={{ background: q.status === 'Converted' ? '#dcfce7' : '#f0efff', color: q.status === 'Converted' ? '#15803d' : '#6c63ff' }}>
                        {q.status}
                      </span>
                    </td>
                    <td>
                      {q.status !== 'Converted' ? (
                        <button
                          className="button primary tiny"
                          onClick={() => handleConvertQuote(q)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}
                        >
                          <ArrowUpRight size={13} /> Convert to Order
                        </button>
                      ) : (
                        <span className="muted" style={{ fontSize: 11 }}>Order Created</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="card table-card">
          <div className="card-heading">
            <div>
              <h2>{activeSubmenu === 'returns' ? 'Processed Sales Returns' : 'All transactions'} ({filtered.length})</h2>
              <p className="muted">Persisted in Laravel SQLite database</p>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((row) => (
                    <tr key={row.id}>
                      <td className="strong" style={{ cursor: 'pointer', color: 'var(--app-primary)' }} onClick={() => setSelectedOrder(row)}>
                        {row.order_number}
                      </td>
                      <td>
                        <b>{row.customer_name}</b>
                        {row.customer_email && <small className="muted" style={{ display: 'block' }}>{row.customer_email}</small>}
                      </td>
                      <td className="muted">{row.date}</td>
                      <td>{row.payment_method}</td>
                      <td className="strong">৳{Number(row.total).toLocaleString()}</td>
                      <td><StatusBadge>{row.status}</StatusBadge></td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn" onClick={() => setSelectedOrder(row)} title="View Receipt">
                            <Eye size={13} />
                          </button>
                          {row.status !== 'Paid' && row.status !== 'Returned' && (
                            <button className="action-btn pay-btn" onClick={() => handleMarkPaid(row.id)}>
                              Mark Paid
                            </button>
                          )}
                          {row.status !== 'Returned' && (
                            <button className="action-btn" onClick={() => setReturningSale(row)} title="Process Return" style={{ color: '#ef4444' }}>
                              <Undo2 size={13} />
                            </button>
                          )}
                          <button className="action-btn delete-btn" onClick={() => handleDelete(row.id)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="empty-state">No matching orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Dynamic Pagination Controls */}
          <div className="pagination">
            <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
            <div>
              <button className="icon-button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="icon-button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>
      )}

      {showModal && (
        <CreateOrderModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            onRefresh()
            showToast('Order saved successfully!')
          }}
        />
      )}

      {selectedOrder && (
        <OrderReceiptModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {returningSale && (
        <ReturnSaleModal
          sale={returningSale}
          onClose={() => setReturningSale(null)}
          onSuccess={() => {
            setReturningSale(null)
            onRefresh()
          }}
          showToast={showToast}
        />
      )}

      {showQuoteModal && (
        <CreateQuotationModal
          products={products}
          onClose={() => setShowQuoteModal(false)}
          onSuccess={(q) => {
            setQuotations([q, ...quotations])
            setShowQuoteModal(false)
          }}
          showToast={showToast}
        />
      )}
    </div>
  )
}

/* ========================================================================= */
/* PRODUCTS VIEW (WITH CATEGORY, WAREHOUSE, STATUS TABS, EDIT & PAGINATION)  */
/* ========================================================================= */

function ProductsView({ products, onRefresh, showToast }: { products: any[]; onRefresh: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [query, setQuery] = useState('')
  const [statusTab, setStatusTab] = useState<'All' | 'in_stock' | 'low_stock' | 'out_of_stock'>('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [warehouseFilter, setWarehouseFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const pageSize = 6

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchQuery = `${p.name} ${p.sku} ${p.category} ${p.warehouse}`.toLowerCase().includes(query.toLowerCase())
      const matchStatus = statusTab === 'All' || p.status === statusTab
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter
      const matchWh = warehouseFilter === 'All' || p.warehouse === warehouseFilter
      return matchQuery && matchStatus && matchCat && matchWh
    })
  }, [products, query, statusTab, categoryFilter, warehouseFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await api.products.delete(id)
      showToast('Product deleted')
      onRefresh()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Workspace / Products</p>
          <h1>Product Catalog</h1>
          <p className="muted">Manage all products, pricing, SKUs, and inventory thresholds.</p>
        </div>
        <button className="button primary" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Add product
        </button>
      </div>

      <div className="card toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            placeholder="Search products..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setCurrentPage(1)
          }}
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Storage">Storage</option>
          <option value="Computers">Computers</option>
          <option value="Accessories">Accessories</option>
          <option value="Networking">Networking</option>
          <option value="Audio">Audio</option>
          <option value="Office supplies">Office supplies</option>
        </select>

        <select
          className="filter-select"
          value={warehouseFilter}
          onChange={(e) => {
            setWarehouseFilter(e.target.value)
            setCurrentPage(1)
          }}
        >
          <option value="All">All Warehouses</option>
          <option value="Dhaka HQ">Dhaka HQ</option>
          <option value="Chittagong">Chittagong</option>
          <option value="Sylhet">Sylhet</option>
        </select>

        <div className="tabs">
          <button className={statusTab === 'All' ? 'active' : ''} onClick={() => { setStatusTab('All'); setCurrentPage(1); }}>All</button>
          <button className={statusTab === 'in_stock' ? 'active' : ''} onClick={() => { setStatusTab('in_stock'); setCurrentPage(1); }}>In stock</button>
          <button className={statusTab === 'low_stock' ? 'active' : ''} onClick={() => { setStatusTab('low_stock'); setCurrentPage(1); }}>Low stock</button>
          <button className={statusTab === 'out_of_stock' ? 'active' : ''} onClick={() => { setStatusTab('out_of_stock'); setCurrentPage(1); }}>Out of stock</button>
        </div>
      </div>

      <section className="card table-card">
        <div className="card-heading">
          <div>
            <h2>Products ({filtered.length})</h2>
            <p className="muted">Persisted in Laravel SQLite database</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Unit Price</th>
                <th>Warehouse</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((p) => (
                  <tr key={p.id || p.sku}>
                    <td className="strong">{p.name}</td>
                    <td className="muted">{p.sku}</td>
                    <td>{p.category}</td>
                    <td className="strong">{p.stock}</td>
                    <td className="strong">৳{Number(p.price).toLocaleString()}</td>
                    <td className="muted">{p.warehouse}</td>
                    <td><StatusBadge>{p.status}</StatusBadge></td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn" onClick={() => setEditingProduct(p)} title="Edit Product">
                          <Edit3 size={13} />
                        </button>
                        <button className="action-btn delete-btn" onClick={() => handleDelete(p.id)} title="Delete Product">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="empty-state">No matching products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
          <div>
            <button className="icon-button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="icon-button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {showModal && (
        <CreateProductModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            onRefresh()
            showToast('Product added successfully!')
          }}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null)
            onRefresh()
            showToast('Product updated successfully!')
          }}
        />
      )}
    </div>
  )
}

/* ========================================================================= */
/* INVENTORY VIEW & PROFESSIONAL STOCK ADJUSTMENT MODAL                      */
/* ========================================================================= */

function AdjustStockModal({
  item,
  onClose,
  onSuccess,
  showToast,
}: {
  item: any
  onClose: () => void
  onSuccess: () => void
  showToast: (m: string, t?: 'success' | 'error') => void
}) {
  const [adjustmentType, setAdjustmentType] = useState<'Damage' | 'Lost' | 'Audit Reconciliation' | 'Demo / Sample' | 'Other Authorized Adjustment'>('Damage')
  const [direction, setDirection] = useState<'decrease' | 'increase'>('decrease')
  const [qty, setQty] = useState(1)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const delta = direction === 'decrease' ? -Math.abs(qty) : Math.abs(qty)
  const previewStock = Math.max(0, (item?.stock || 0) + delta)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      alert('Please provide a required reason for this stock adjustment.')
      return
    }
    setSubmitting(true)
    try {
      await api.inventory.adjust({
        product_id: item.id,
        adjustment_type: adjustmentType,
        quantity: delta,
        reason: reason.trim(),
        warehouse: item.warehouse,
      })
      showToast(`Stock adjusted to ${previewStock} and logged to audit trail!`)
      onSuccess()
    } catch (err: any) {
      showToast(err.message || 'Failed to adjust stock', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 480px)' }}>
        <div className="modal-heading">
          <div>
            <h2>Adjust Stock</h2>
            <p className="muted">Record verified warehouse inventory adjustments with audit trail.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <div style={{ padding: '12px 14px', background: 'var(--app-bg)', borderRadius: 8, display: 'grid', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <b>{item.name}</b>
              <span className="badge badge-purple">{item.sku}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--app-muted)' }}>
              <span>Warehouse: <b>{item.warehouse}</b></span>
              <span>On Hand: <b>{item.stock} units</b></span>
            </div>
          </div>

          <label>
            Adjustment Type *
            <select
              value={adjustmentType}
              onChange={(e) => {
                const val = e.target.value as any
                setAdjustmentType(val)
                if (val === 'Damage' || val === 'Lost' || val === 'Demo / Sample') {
                  setDirection('decrease')
                }
              }}
            >
              <option value="Damage">Damage (Broken / Expired)</option>
              <option value="Lost">Lost / Missing</option>
              <option value="Audit Reconciliation">Audit Reconciliation (Discrepancy)</option>
              <option value="Demo / Sample">Demo / Showroom Sample</option>
              <option value="Other Authorized Adjustment">Other Authorized Adjustment</option>
            </select>
          </label>

          <div className="form-grid-2">
            <label>
              Direction
              <select value={direction} onChange={(e) => setDirection(e.target.value as any)}>
                <option value="decrease">Deduct / Decrease (-)</option>
                <option value="increase">Add / Increase (+)</option>
              </select>
            </label>
            <label>
              Adjustment Quantity *
              <input
                type="number"
                min="1"
                max={direction === 'decrease' ? item.stock : 10000}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                required
              />
            </label>
          </div>

          <label>
            Required Reason / Authorization Reference *
            <input
              placeholder="e.g. Broken in transit / Shelf count verification"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </label>

          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(108, 99, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 500 }}>New Stock Preview:</span>
            <b style={{ fontSize: 14, color: 'var(--app-primary)' }}>
              {item.stock} ➔ {previewStock} units ({delta > 0 ? `+${delta}` : delta})
            </b>
          </div>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InventoryView({
  products,
  activeSubmenu = 'overview',
  onRefresh,
  showToast,
}: {
  products: any[]
  activeSubmenu?: string
  onRefresh: () => void
  showToast: (m: string, t?: 'success' | 'error') => void
}) {
  const [query, setQuery] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [adjustingItem, setAdjustingItem] = useState<any>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const pageSize = 8

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchQuery = `${p.name} ${p.sku} ${p.warehouse}`.toLowerCase().includes(query.toLowerCase())
      const matchWh = warehouseFilter === 'All' || p.warehouse === warehouseFilter
      const matchSubmenu = activeSubmenu === 'alerts' ? (p.stock <= (p.threshold || 10)) : true
      return matchQuery && matchWh && matchSubmenu
    })
  }, [products, query, warehouseFilter, activeSubmenu])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Workspace / Inventory</p>
          <h1>Inventory & Warehouses</h1>
          <p className="muted">Real-time stock levels, reorder thresholds, and warehouse distributions.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="button secondary" onClick={() => setShowTransferModal(true)}>
            <ArrowRightLeft size={16} /> Transfer Stock
          </button>
        </div>
      </div>

      <div className="card toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            placeholder="Search inventory..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        <select
          className="filter-select"
          value={warehouseFilter}
          onChange={(e) => {
            setWarehouseFilter(e.target.value)
            setCurrentPage(1)
          }}
        >
          <option value="All">All Warehouses</option>
          <option value="Dhaka HQ">Dhaka HQ</option>
          <option value="Chittagong">Chittagong</option>
          <option value="Sylhet">Sylhet</option>
        </select>
      </div>

      <section className="card table-card">
        <div className="card-heading">
          <div>
            <h2>Inventory status ({filtered.length} items)</h2>
            <p className="muted">Live stock level tracking</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Warehouse</th>
                <th>On Hand</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Adjustment</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => (
                <tr key={item.id}>
                  <td className="strong">{item.name}</td>
                  <td className="muted">{item.sku}</td>
                  <td>{item.warehouse}</td>
                  <td className="strong">{item.stock}</td>
                  <td className="muted">{item.threshold || 10}</td>
                  <td><StatusBadge>{item.status}</StatusBadge></td>
                  <td>
                    <button
                      className="button secondary tiny"
                      onClick={() => setAdjustingItem(item)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}
                    >
                      <Sliders size={13} /> Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
          <div>
            <button className="icon-button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="icon-button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {adjustingItem && (
        <AdjustStockModal
          item={adjustingItem}
          onClose={() => setAdjustingItem(null)}
          onSuccess={() => {
            setAdjustingItem(null)
            onRefresh()
          }}
          showToast={showToast}
        />
      )}

      {showTransferModal && (
        <TransferStockModal
          products={products}
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => {
            setShowTransferModal(false)
            onRefresh()
          }}
          showToast={showToast}
        />
      )}
    </div>
  )
}

/* ========================================================================= */
/* PURCHASES VIEW                                                            */
/* ========================================================================= */

function PurchasesView({
  purchases,
  products = [],
  activeSubmenu = 'overview',
  onRefresh,
  showToast,
}: {
  purchases: any[]
  products?: any[]
  activeSubmenu?: string
  onRefresh: () => void
  showToast: (m: string, t?: 'success' | 'error') => void
}) {
  const [query, setQuery] = useState('')
  const [statusTab, setStatusTab] = useState<'All' | 'Pending' | 'Received' | 'Partially received'>('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [receivingPO, setReceivingPO] = useState<any>(null)
  const pageSize = 6

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const matchQuery = `${p.po_number} ${p.supplier_name} ${p.status}`.toLowerCase().includes(query.toLowerCase())
      const matchStatus = statusTab === 'All' || p.status === statusTab
      return matchQuery && matchStatus
    })
  }, [purchases, query, statusTab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Workspace / Purchases</p>
          <h1>Purchase Orders</h1>
          <p className="muted">Procurement, supplier tracking, and supply chain management.</p>
        </div>
        <button className="button primary" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Create PO
        </button>
      </div>

      <div className="card toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            placeholder="Search POs..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        <div className="tabs">
          {(['All', 'Pending', 'Received', 'Partially received'] as const).map(tab => (
            <button
              key={tab}
              className={statusTab === tab ? 'active' : ''}
              onClick={() => {
                setStatusTab(tab)
                setCurrentPage(1)
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <section className="card table-card">
        <div className="card-heading">
          <div>
            <h2>Purchase orders ({filtered.length})</h2>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Items Count</th>
                <th>Total Cost</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((po) => (
                <tr key={po.id}>
                  <td className="strong">{po.po_number}</td>
                  <td>{po.supplier_name}</td>
                  <td><b>{po.received_quantity || 0}</b> / {po.items_count} items</td>
                  <td className="strong">৳{Number(po.total_amount).toLocaleString()}</td>
                  <td className="muted">{po.date}</td>
                  <td><StatusBadge>{po.status}</StatusBadge></td>
                  <td>
                    {po.status !== 'Received' ? (
                      <button
                        className="button primary tiny"
                        onClick={() => setReceivingPO(po)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}
                      >
                        <PackageCheck size={13} /> Receive Goods
                      </button>
                    ) : (
                      <span className="code-badge" style={{ background: '#ecfdf5', color: '#047857' }}>Posted to Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
          <div>
            <button className="icon-button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="icon-button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {showModal && (
        <CreatePurchaseModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            onRefresh()
            showToast('Purchase Order created!')
          }}
        />
      )}

      {receivingPO && (
        <ReceiveGoodsModal
          purchase={receivingPO}
          products={products}
          onClose={() => setReceivingPO(null)}
          onSuccess={() => {
            setReceivingPO(null)
            onRefresh()
          }}
          showToast={showToast}
        />
      )}
    </div>
  )
}

/* ========================================================================= */
/* CUSTOMERS VIEW                                                            */
/* ========================================================================= */

function CustomersView({ customers, onRefresh, showToast }: { customers: any[]; onRefresh: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [query, setQuery] = useState('')
  const [tierTab, setTierTab] = useState<'All' | 'Enterprise' | 'Business' | 'Standard'>('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [selectedCust, setSelectedCust] = useState<any>(null)
  const pageSize = 6

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchQuery = `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(query.toLowerCase())
      const matchTier = tierTab === 'All' || c.tier === tierTab
      return matchQuery && matchTier
    })
  }, [customers, query, tierTab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this customer?')) return
    try {
      await api.customers.delete(id)
      showToast('Customer deleted')
      onRefresh()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Workspace / Customers</p>
          <h1>Customer CRM Directory</h1>
          <p className="muted">Manage client relationships, enterprise accounts, and lifetime value.</p>
        </div>
        <button className="button primary" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Add customer
        </button>
      </div>

      <div className="card toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            placeholder="Search customers..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        <div className="tabs">
          {(['All', 'Enterprise', 'Business', 'Standard'] as const).map(tab => (
            <button
              key={tab}
              className={tierTab === tab ? 'active' : ''}
              onClick={() => {
                setTierTab(tab)
                setCurrentPage(1)
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <section className="card table-card">
        <div className="card-heading">
          <div>
            <h2>Customer directory ({filtered.length})</h2>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Company</th>
                <th>Tier</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="person-cell" style={{ cursor: 'pointer' }} onClick={() => setSelectedCust(c)}>
                      <span className="avatar small">{c.name.charAt(0)}</span>
                      <div>
                        <b>{c.name}</b>
                        <small>{c.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{c.company}</td>
                  <td><span className="badge">{c.tier}</span></td>
                  <td className="strong">৳{Number(c.spent).toLocaleString()}</td>
                  <td><StatusBadge>{c.status}</StatusBadge></td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn" onClick={() => setSelectedCust(c)} title="View Customer Details">
                        <Eye size={13} />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(c.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
          <div>
            <button className="icon-button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="icon-button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {showModal && (
        <CreateCustomerModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            onRefresh()
            showToast('Customer added successfully!')
          }}
        />
      )}

      {selectedCust && (
        <CustomerDetailsModal
          customer={selectedCust}
          onClose={() => setSelectedCust(null)}
        />
      )}
    </div>
  )
}

/* ========================================================================= */
/* EMPLOYEES VIEW (PHASE 3A ATTENDANCE & LEAVES, 3B PAYROLL, 3C SELF-SERVICE)*/
/* ========================================================================= */

function EmployeesView({
  employees,
  activeSubmenu = 'directory',
  onSelectSubmenu,
  onRefresh,
  showToast,
}: {
  employees: any[]
  activeSubmenu?: string
  onSelectSubmenu?: (sub: string) => void
  onRefresh: () => void
  showToast: (m: string, t?: 'success' | 'error') => void
}) {
  const [currentTab, setCurrentTab] = useState(activeSubmenu || 'directory')
  const [query, setQuery] = useState('')
  const [deptTab, setDeptTab] = useState<'All' | 'Sales' | 'Inventory' | 'Finance' | 'HR' | 'IT'>('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedPayslipId, setSelectedPayslipId] = useState<number | null>(null)
  const pageSize = 6

  // Phase 3A: Attendance State
  const [attendances, setAttendances] = useState<any[]>([])
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null)
  const [loadingAttendance, setLoadingAttendance] = useState(false)

  // Phase 3A: Leaves State
  const [leaves, setLeaves] = useState<any[]>([])
  const [loadingLeaves, setLoadingLeaves] = useState(false)

  // Phase 3B: Payroll State
  const [payrollMonth, setPayrollMonth] = useState('2026-10')
  const [payrolls, setPayrolls] = useState<any[]>([])
  const [loadingPayrolls, setLoadingPayrolls] = useState(false)

  // Phase 3C: Self-Service State
  const [portalData, setPortalData] = useState<any>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)

  useEffect(() => {
    if (activeSubmenu) {
      setCurrentTab(activeSubmenu)
    }
  }, [activeSubmenu])

  // Load Attendance
  const loadAttendance = useCallback(async () => {
    setLoadingAttendance(true)
    try {
      const [list, sum] = await Promise.all([
        api.attendances.list(),
        api.attendances.summary(),
      ])
      setAttendances(list)
      setAttendanceSummary(sum)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoadingAttendance(false)
    }
  }, [])

  // Load Leaves
  const loadLeaves = useCallback(async () => {
    setLoadingLeaves(true)
    try {
      const list = await api.leaves.list()
      setLeaves(list)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoadingLeaves(false)
    }
  }, [])

  // Load Payroll
  const loadPayrolls = useCallback(async () => {
    setLoadingPayrolls(true)
    try {
      const list = await api.payrolls.list({ month: payrollMonth })
      setPayrolls(list)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoadingPayrolls(false)
    }
  }, [payrollMonth])

  // Load Self-Service
  const loadPortal = useCallback(async () => {
    setLoadingPortal(true)
    try {
      const data = await api.selfService.portal()
      setPortalData(data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoadingPortal(false)
    }
  }, [])

  useEffect(() => {
    if (currentTab === 'attendance') {
      loadAttendance()
    } else if (currentTab === 'leaves') {
      loadLeaves()
    } else if (currentTab === 'payroll') {
      loadPayrolls()
    } else if (currentTab === 'self-service') {
      loadPortal()
    }
  }, [currentTab, loadAttendance, loadLeaves, loadPayrolls, loadPortal])

  // Clock In Action
  const handleClockIn = async () => {
    try {
      await api.attendances.clockIn()
      showToast('Checked in successfully!')
      loadAttendance()
      if (currentTab === 'self-service') loadPortal()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Clock Out Action
  const handleClockOut = async () => {
    try {
      await api.attendances.clockOut()
      showToast('Clocked out successfully!')
      loadAttendance()
      if (currentTab === 'self-service') loadPortal()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Approve Leave Action
  const handleApproveLeave = async (id: number) => {
    try {
      await api.leaves.updateStatus(id, { status: 'Approved' })
      showToast('Leave request approved!')
      loadLeaves()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Reject Leave Action
  const handleRejectLeave = async (id: number) => {
    const reason = prompt('Please enter rejection reason:')
    if (reason === null) return
    try {
      await api.leaves.updateStatus(id, { status: 'Rejected', rejection_reason: reason })
      showToast('Leave request rejected.', 'error')
      loadLeaves()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Generate Payroll Action
  const handleGeneratePayroll = async () => {
    try {
      await api.payrolls.generate({ month: payrollMonth })
      showToast(`Payroll generated for ${payrollMonth}!`)
      loadPayrolls()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Mark Payroll as Paid
  const handleMarkPaid = async (id: number) => {
    if (!confirm('Disburse salary and post to Finance & General Ledger?')) return
    try {
      await api.payrolls.updateStatus(id, { status: 'Paid', payment_method: 'Bank Transfer' })
      showToast('Salary disbursed and recorded in Finance & General Ledger!')
      loadPayrolls()
      onRefresh()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchQuery = `${e.name} ${e.email} ${e.role} ${e.department}`.toLowerCase().includes(query.toLowerCase())
      const matchDept = deptTab === 'All' || e.department === deptTab
      return matchQuery && matchDept
    })
  }, [employees, query, deptTab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Submenu tabs for switching directly inside view
  const subTabs = [
    { id: 'directory', label: 'Directory' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'leaves', label: 'Leaves' },
    { id: 'payroll', label: 'Payroll & Payslips' },
    { id: 'self-service', label: 'Self-Service' },
    { id: 'departments', label: 'Departments' },
    { id: 'designations', label: 'Designations' },
    { id: 'documents', label: 'Documents' },
    { id: 'reports', label: 'Reports' },
  ]

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Workspace / Human Capital</p>
          <h1>Human Resources & Workforce</h1>
          <p className="muted">Manage workforce, biometric attendance, leave policies, and automated payroll.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {currentTab === 'attendance' && (
            <>
              <button className="button secondary" onClick={() => setShowAttendanceModal(true)}>
                <Calendar size={16} /> Record Manual
              </button>
              <button className="button primary" onClick={handleClockIn}>
                <Clock size={16} /> Clock In Now
              </button>
            </>
          )}
          {currentTab === 'leaves' && (
            <button className="button primary" onClick={() => setShowLeaveModal(true)}>
              <Plus size={16} /> Apply for Leave
            </button>
          )}
          {currentTab === 'payroll' && (
            <button className="button primary" onClick={handleGeneratePayroll}>
              <Receipt size={16} /> Generate Monthly Payroll
            </button>
          )}
          {currentTab === 'directory' && (
            <button className="button primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add employee
            </button>
          )}
        </div>
      </div>

      {/* Submenu navigation bar */}
      <div className="card toolbar" style={{ padding: '8px 12px', marginBottom: 16 }}>
        <div className="tabs" style={{ border: 'none', margin: 0 }}>
          {subTabs.map(t => (
            <button
              key={t.id}
              className={currentTab === t.id ? 'active' : ''}
              onClick={() => {
                setCurrentTab(t.id)
                if (onSelectSubmenu) onSelectSubmenu(t.id)
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {/* 1. ATTENDANCE SUBMENU (PHASE 3A) */}
      {currentTab === 'attendance' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="stats-grid">
            <StatCard title="Active Workforce" value={attendanceSummary?.total_employees || employees.length} change={0} icon={Users} tone="purple" />
            <StatCard title="Present Today" value={attendanceSummary?.present || 0} change={5.2} icon={CheckCircle2} tone="green" />
            <StatCard title="Late Arrivals" value={attendanceSummary?.late || 0} change={-2.1} icon={Clock} tone="orange" />
            <StatCard title="On Leave" value={attendanceSummary?.on_leave || 0} change={0} icon={Calendar} tone="blue" />
          </div>

          <section className="card table-card">
            <div className="card-heading">
              <div>
                <h2>Today's Attendance Sheet ({attendances.length} records)</h2>
                <p className="muted">Biometric & manual clock-in logs with work duration tracking.</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="button secondary" onClick={handleClockOut}>
                  <Clock size={15} /> Clock Out Today
                </button>
                <button className="button secondary" onClick={loadAttendance}>
                  <RefreshCw size={15} /> Refresh
                </button>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Work Duration</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAttendance ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>Loading attendance logs...</td></tr>
                  ) : attendances.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>No attendance records found. Use "Clock In Now" or "Record Manual" above.</td></tr>
                  ) : (
                    attendances.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div className="person-cell">
                            <span className="avatar small">{a.employee?.name?.charAt(0) || 'E'}</span>
                            <div>
                              <b>{a.employee?.name || 'Employee'}</b>
                              <small>{a.employee?.department || 'Department'}</small>
                            </div>
                          </div>
                        </td>
                        <td className="muted">{a.date ? new Date(a.date).toLocaleDateString('en-GB') : 'Today'}</td>
                        <td className="strong">{a.clock_in || '—'}</td>
                        <td className="strong">{a.clock_out || '—'}</td>
                        <td>{a.work_hours > 0 ? `${a.work_hours} hrs` : (a.clock_in ? 'In Progress' : '—')}</td>
                        <td>
                          <span className={`status-badge ${a.status === 'Present' ? 'in-stock' : a.status === 'Late' ? 'low-stock' : a.status === 'On Leave' ? 'paid' : 'out-of-stock'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="muted">{a.notes || 'Normal shift'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 2. LEAVE MANAGEMENT SUBMENU (PHASE 3A) */}
      {currentTab === 'leaves' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="stats-grid">
            <StatCard title="Casual Leave Quota" value="14 Days / Year" change={0} icon={Calendar} tone="green" />
            <StatCard title="Sick Leave Quota" value="10 Days / Year" change={0} icon={AlertTriangle} tone="orange" />
            <StatCard title="Annual Leave Quota" value="15 Days / Year" change={0} icon={BriefcaseBusiness} tone="blue" />
            <StatCard title="Pending Applications" value={leaves.filter(l => l.status === 'Pending').length} change={0} icon={Clock} tone="purple" />
          </div>

          <section className="card table-card">
            <div className="card-heading">
              <div>
                <h2>Leave Applications ({leaves.length})</h2>
                <p className="muted">Review, approve, or reject employee absence requests.</p>
              </div>
              <button className="button secondary" onClick={loadLeaves}>
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLeaves ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>Loading leave requests...</td></tr>
                  ) : leaves.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>No leave requests found. Click "Apply for Leave" to create one.</td></tr>
                  ) : (
                    leaves.map(l => (
                      <tr key={l.id}>
                        <td>
                          <div className="person-cell">
                            <span className="avatar small">{l.employee?.name?.charAt(0) || 'E'}</span>
                            <div>
                              <b>{l.employee?.name || 'Staff Member'}</b>
                              <small>{l.employee?.role}</small>
                            </div>
                          </div>
                        </td>
                        <td className="strong">{l.leave_type}</td>
                        <td className="muted">
                          {new Date(l.start_date).toLocaleDateString('en-GB')} → {new Date(l.end_date).toLocaleDateString('en-GB')}
                        </td>
                        <td><b>{l.days_count}</b> days</td>
                        <td style={{ maxWidth: 220 }}>{l.reason}</td>
                        <td>
                          <span className={`status-badge ${l.status === 'Approved' ? 'in-stock' : l.status === 'Rejected' ? 'out-of-stock' : 'low-stock'}`}>
                            {l.status}
                          </span>
                        </td>
                        <td>
                          {l.status === 'Pending' ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="button primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleApproveLeave(l.id)}>
                                Approve
                              </button>
                              <button className="button secondary" style={{ padding: '4px 10px', fontSize: 12, color: '#dc2626' }} onClick={() => handleRejectLeave(l.id)}>
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="muted" style={{ fontSize: 12 }}>Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 3. PAYROLL & PAYSLIPS SUBMENU (PHASE 3B) */}
      {currentTab === 'payroll' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <b>Payroll Month:</b>
              <select value={payrollMonth} onChange={(e) => setPayrollMonth(e.target.value)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                <option value="2026-10">October 2026</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-08">August 2026</option>
              </select>
              <button className="button secondary" onClick={loadPayrolls}>
                <RefreshCw size={14} /> Fetch Records
              </button>
            </div>
            <button className="button primary" onClick={handleGeneratePayroll}>
              <Receipt size={16} /> Auto-Calculate & Generate for {payrollMonth}
            </button>
          </div>

          <div className="stats-grid">
            <StatCard
              title="Total Gross Salary"
              value={`৳${payrolls.reduce((sum, p) => sum + Number(p.basic_salary) + Number(p.allowances), 0).toLocaleString()}`}
              change={2.4}
              icon={DollarSign}
              tone="purple"
            />
            <StatCard
              title="Total Deductions (PF/Tax)"
              value={`৳${payrolls.reduce((sum, p) => sum + Number(p.deductions), 0).toLocaleString()}`}
              change={0}
              icon={Percent}
              tone="orange"
            />
            <StatCard
              title="Net Disbursement"
              value={`৳${payrolls.reduce((sum, p) => sum + Number(p.net_salary), 0).toLocaleString()}`}
              change={2.1}
              icon={CreditCard}
              tone="green"
            />
            <StatCard
              title="Paid Slips"
              value={`${payrolls.filter(p => p.status === 'Paid').length} / ${payrolls.length}`}
              change={0}
              icon={CheckCircle2}
              tone="blue"
            />
          </div>

          <section className="card table-card">
            <div className="card-heading">
              <div>
                <h2>Monthly Payroll Register ({payrolls.length} payslips)</h2>
                <p className="muted">NBR-compliant salary breakdown: 60% Basic, 40% Allowances, 5% Provident Fund, Tax TDS.</p>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Basic (৳)</th>
                    <th>Allowances (৳)</th>
                    <th>Deductions (৳)</th>
                    <th>Net Salary (৳)</th>
                    <th>Payment Mode</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPayrolls ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>Loading payroll records...</td></tr>
                  ) : payrolls.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>No payroll generated for {payrollMonth}. Click "Auto-Calculate & Generate" above.</td></tr>
                  ) : (
                    payrolls.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="person-cell">
                            <span className="avatar small">{p.employee?.name?.charAt(0) || 'E'}</span>
                            <div>
                              <b>{p.employee?.name || 'Staff'}</b>
                              <small>{p.employee?.role} • {p.employee?.department}</small>
                            </div>
                          </div>
                        </td>
                        <td>৳{Number(p.basic_salary).toLocaleString()}</td>
                        <td>৳{Number(p.allowances).toLocaleString()}</td>
                        <td style={{ color: '#dc2626' }}>৳{Number(p.deductions).toLocaleString()}</td>
                        <td className="strong" style={{ color: '#4338ca' }}>৳{Number(p.net_salary).toLocaleString()}</td>
                        <td className="muted">{p.payment_method || 'Bank Transfer'}</td>
                        <td>
                          <span className={`status-badge ${p.status === 'Paid' ? 'in-stock' : 'low-stock'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {p.status !== 'Paid' && (
                              <button className="button primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => handleMarkPaid(p.id)}>
                                Mark Paid
                              </button>
                            )}
                            <button className="button secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setSelectedPayslipId(p.id)}>
                              <Eye size={13} /> View Slip
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 4. EMPLOYEE SELF-SERVICE PORTAL (PHASE 3C) */}
      {currentTab === 'self-service' && (
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Profile Card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="avatar" style={{ width: 56, height: 56, fontSize: 22, background: '#6c63ff', color: '#fff', display: 'grid', placeItems: 'center', borderRadius: '50%' }}>
                {portalData?.employee?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{portalData?.employee?.name || 'My Employee Profile'}</h2>
                <p className="muted" style={{ margin: '4px 0 0 0' }}>
                  {portalData?.employee?.role || 'Team Member'} • {portalData?.employee?.department || 'Operations'} ({portalData?.employee?.code || 'EMP-001'})
                </p>
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                  {portalData?.employee?.email} | {portalData?.employee?.phone || '+880 1711-000000'} | Joined: {portalData?.employee?.hire_date ? new Date(portalData.employee.hire_date).toLocaleDateString('en-GB') : '2026-01-01'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="button primary" onClick={handleClockIn}>
                <Clock size={16} /> Clock In
              </button>
              <button className="button secondary" onClick={handleClockOut}>
                <Clock size={16} /> Clock Out
              </button>
              <button className="button secondary" onClick={() => setShowLeaveModal(true)}>
                <Calendar size={16} /> Apply Leave
              </button>
            </div>
          </div>

          {/* Today's Punch & Leave Balances */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <div className="card" style={{ padding: 18 }}>
              <h3 style={{ margin: '0 0 12px 0' }}>Today's Shift Status</h3>
              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 12 }}>
                <p style={{ margin: '0 0 6px 0', fontSize: 13 }}>
                  <b>Date:</b> {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p style={{ margin: '0 0 6px 0', fontSize: 13 }}>
                  <b>Clock-In Time:</b> {portalData?.today_attendance?.clock_in || 'Not checked in yet'}
                </p>
                <p style={{ margin: '0 0 6px 0', fontSize: 13 }}>
                  <b>Clock-Out Time:</b> {portalData?.today_attendance?.clock_out || 'Pending'}
                </p>
                <p style={{ margin: 0, fontSize: 13 }}>
                  <b>Status:</b>{' '}
                  <span className={`status-badge ${portalData?.today_attendance ? 'in-stock' : 'low-stock'}`}>
                    {portalData?.today_attendance?.status || 'Awaiting Check-in'}
                  </span>
                </p>
              </div>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <h3 style={{ margin: '0 0 12px 0' }}>My Annual Leave Quotas</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {(portalData?.leave_balances || [
                  { type: 'Casual Leave', total: 14, used: 2, remaining: 12 },
                  { type: 'Sick Leave', total: 10, used: 0, remaining: 10 },
                  { type: 'Annual Leave', total: 15, used: 1, remaining: 14 },
                ]).map((b: any) => (
                  <div key={b.type} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{b.type}</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#6c63ff' }}>{b.remaining}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Remaining of {b.total} days</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Payslips */}
          <section className="card table-card">
            <div className="card-heading">
              <div>
                <h2>My Recent Payslips</h2>
                <p className="muted">Official salary slips and tax withholdings.</p>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Basic Salary</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Net Take-Home</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(portalData?.recent_payrolls || []).length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>No payslips generated yet. Contact HR or generate monthly payroll.</td></tr>
                  ) : (
                    portalData.recent_payrolls.map((p: any) => (
                      <tr key={p.id}>
                        <td className="strong">{p.month}</td>
                        <td>৳{Number(p.basic_salary).toLocaleString()}</td>
                        <td>৳{Number(p.allowances).toLocaleString()}</td>
                        <td style={{ color: '#dc2626' }}>৳{Number(p.deductions).toLocaleString()}</td>
                        <td className="strong" style={{ color: '#4338ca' }}>৳{Number(p.net_salary).toLocaleString()}</td>
                        <td><span className={`status-badge ${p.status === 'Paid' ? 'in-stock' : 'low-stock'}`}>{p.status}</span></td>
                        <td>
                          <button className="button secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setSelectedPayslipId(p.id)}>
                            <Printer size={13} /> View Slip
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 5. DEPARTMENTS SUBMENU */}
      {currentTab === 'departments' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { name: 'Engineering & IT', head: 'Alex Morgan', members: 4, budget: 280000, tone: '#6366f1' },
            { name: 'Sales & BD', head: 'Mahfuzur Rahman', members: 3, budget: 145000, tone: '#10b981' },
            { name: 'Operations & Depot', head: 'Rafiq Uddin', members: 2, budget: 85000, tone: '#f59e0b' },
            { name: 'Finance & Accounts', head: 'Farhana Islam', members: 2, budget: 110000, tone: '#ec4899' },
            { name: 'Human Resources', head: 'Nusrat Ahmed', members: 1, budget: 55000, tone: '#06b6d4' },
          ].map(d => (
            <div key={d.name} className="card" style={{ padding: 18, borderTop: `4px solid ${d.tone}` }}>
              <h3 style={{ margin: '0 0 6px 0' }}>{d.name}</h3>
              <p className="muted" style={{ margin: '0 0 12px 0', fontSize: 13 }}>Lead: <b>{d.head}</b></p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>Headcount:</span>
                <b>{d.members} members</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>Monthly Payroll:</span>
                <b style={{ color: '#4338ca' }}>৳{d.budget.toLocaleString()}</b>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. DESIGNATIONS SUBMENU */}
      {currentTab === 'designations' && (
        <section className="card table-card">
          <div className="card-heading">
            <div>
              <h2>Official Designations & Hierarchy</h2>
              <p className="muted">Standardized corporate roles across NS ERP.</p>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Job Title / Designation</th>
                  <th>Department</th>
                  <th>Standard Grade</th>
                  <th>Base Benchmark (৳)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { title: 'Chief Technology Officer', dept: 'IT', grade: 'Executive (E-1)', salary: '৳1,20,000' },
                  { title: 'Senior Fullstack Engineer', dept: 'IT', grade: 'Senior Professional (P-3)', salary: '৳85,000' },
                  { title: 'Head of Sales', dept: 'Sales', grade: 'Management (M-2)', salary: '৳75,000' },
                  { title: 'Senior Accountant', dept: 'Finance', grade: 'Professional (P-2)', salary: '৳65,000' },
                  { title: 'Warehouse Depot Manager', dept: 'Operations', grade: 'Supervisor (S-1)', salary: '৳50,000' },
                  { title: 'Logistics Officer', dept: 'Operations', grade: 'Associate (A-1)', salary: '৳35,000' },
                ].map(r => (
                  <tr key={r.title}>
                    <td className="strong">{r.title}</td>
                    <td>{r.dept}</td>
                    <td><span className="status-badge paid">{r.grade}</span></td>
                    <td className="strong">{r.salary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 7. DOCUMENTS SUBMENU */}
      {currentTab === 'documents' && (
        <section className="card table-card">
          <div className="card-heading">
            <div>
              <h2>HR & Compliance Documents</h2>
              <p className="muted">Employment contracts, NDA, NID, and Tax TIN filings.</p>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Category</th>
                  <th>Required For</th>
                  <th>Format</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Standard Employment Contract 2026', cat: 'Legal & HR', for: 'All New Hires', type: 'PDF' },
                  { name: 'Mutual Non-Disclosure Agreement (NDA)', cat: 'Security', for: 'All Staff', type: 'PDF' },
                  { name: 'Bangladesh Labor Law Compliance Handbook', cat: 'Policy', for: 'Company Wide', type: 'PDF' },
                  { name: 'TIN & IT-10B Tax Deduction Certificate Form', cat: 'Tax & Finance', for: 'Taxable Employees', type: 'DOCX' },
                ].map(doc => (
                  <tr key={doc.name}>
                    <td className="strong">{doc.name}</td>
                    <td>{doc.cat}</td>
                    <td className="muted">{doc.for}</td>
                    <td><span className="status-badge in-stock">{doc.type}</span></td>
                    <td>
                      <button className="button secondary" style={{ padding: '4px 10px', fontSize: 12 }}>
                        <Download size={13} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 8. REPORTS SUBMENU */}
      {currentTab === 'reports' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="stats-grid">
            <StatCard title="Overall Attendance Rate" value="95.4%" change={1.2} icon={CheckCircle2} tone="green" />
            <StatCard title="Average Tenure" value="2.4 Years" change={0.4} icon={BriefcaseBusiness} tone="blue" />
            <StatCard title="Annual Leave Utilization" value="22.8%" change={-3.1} icon={Calendar} tone="orange" />
            <StatCard title="Payroll to Revenue Ratio" value="16.2%" change={-1.5} icon={Percent} tone="purple" />
          </div>
        </div>
      )}

      {/* 9. DIRECTORY SUBMENU (DEFAULT) */}
      {(currentTab === 'directory' || currentTab === 'add') && (
        <>
          <div className="card toolbar">
            <div className="search-field">
              <Search size={17} />
              <input
                placeholder="Search employees by name, role, department..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            <div className="tabs">
              {(['All', 'Sales', 'Inventory', 'Finance', 'HR', 'IT'] as const).map(tab => (
                <button
                  key={tab}
                  className={deptTab === tab ? 'active' : ''}
                  onClick={() => {
                    setDeptTab(tab)
                    setCurrentPage(1)
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <section className="card table-card">
            <div className="card-heading">
              <div>
                <h2>Staff Directory ({filtered.length} employees)</h2>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Gross Salary</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <div className="person-cell">
                          <span className="avatar small">{e.name.charAt(0)}</span>
                          <div>
                            <b>{e.name}</b>
                            <small>{e.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="strong">{e.role}</td>
                      <td>{e.department}</td>
                      <td className="muted">{e.phone || 'N/A'}</td>
                      <td className="strong">৳{Number(e.salary || 45000).toLocaleString()}</td>
                      <td><StatusBadge>{e.status}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
              <div>
                <button className="icon-button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className="icon-button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Modals */}
      {showModal && (
        <CreateEmployeeModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            onRefresh()
            showToast('Employee added to database!')
          }}
        />
      )}

      {showLeaveModal && (
        <ApplyLeaveModal
          employees={employees}
          onClose={() => setShowLeaveModal(false)}
          onSuccess={() => {
            setShowLeaveModal(false)
            loadLeaves()
            showToast('Leave request submitted!')
          }}
        />
      )}

      {showAttendanceModal && (
        <RecordAttendanceModal
          employees={employees}
          onClose={() => setShowAttendanceModal(false)}
          onSuccess={() => {
            setShowAttendanceModal(false)
            loadAttendance()
            showToast('Attendance recorded!')
          }}
        />
      )}

      {selectedPayslipId !== null && (
        <PayslipModal
          payslipId={selectedPayslipId}
          onClose={() => setSelectedPayslipId(null)}
        />
      )}
    </div>
  )
}

/* ========================================================================= */
/* FINANCE VIEW (PHASE 3D: BANK A/C, TRANSACTIONS, GENERAL LEDGER, P&L, B/S) */
/* ========================================================================= */

function FinanceView({
  invoices,
  activeSubmenu = 'overview',
  onSelectSubmenu,
  onRefresh,
  showToast,
}: {
  invoices: any[]
  activeSubmenu?: string
  onSelectSubmenu?: (sub: string) => void
  onRefresh: () => void
  showToast: (m: string, t?: 'success' | 'error') => void
}) {
  const [currentTab, setCurrentTab] = useState(activeSubmenu || 'overview')
  const [query, setQuery] = useState('')
  const [statusTab, setStatusTab] = useState<'All' | 'Paid' | 'Unpaid' | 'Overdue' | 'Partially paid'>('All')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  const filtered = useMemo(() => {
    return invoices.filter((i) => {
      const matchQuery = `${i.invoice_number} ${i.customer_name} ${i.status}`.toLowerCase().includes(query.toLowerCase())
      const matchStatus = statusTab === 'All' || i.status === statusTab
      return matchQuery && matchStatus
    })
  }, [invoices, query, statusTab])
  // Phase 3D Finance State
  const [accounts, setAccounts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [txnFilter, setTxnFilter] = useState<'All' | 'Income' | 'Expense'>('All')
  const [ledgerData, setLedgerData] = useState<any>(null)
  const [pnlData, setPnlData] = useState<any>(null)
  const [balanceSheetData, setBalanceSheetData] = useState<any>(null)
  const [loadingFinance, setLoadingFinance] = useState(false)
  const [showTxnModal, setShowTxnModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)

  useEffect(() => {
    if (activeSubmenu) {
      setCurrentTab(activeSubmenu)
    }
  }, [activeSubmenu])

  // Load Accounts
  const loadAccounts = useCallback(async () => {
    try {
      const accs = await api.finance.accounts()
      setAccounts(accs)
    } catch (err) {
      console.error(err)
    }
  }, [])

  // Load Transactions
  const loadTransactions = useCallback(async () => {
    setLoadingFinance(true)
    try {
      const txns = await api.finance.transactions()
      setTransactions(txns)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingFinance(false)
    }
  }, [])

  // Load General Ledger
  const loadGeneralLedger = useCallback(async () => {
    setLoadingFinance(true)
    try {
      const data = await api.finance.generalLedger()
      setLedgerData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingFinance(false)
    }
  }, [])

  // Load P&L
  const loadPnl = useCallback(async () => {
    setLoadingFinance(true)
    try {
      const data = await api.finance.pnl()
      setPnlData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingFinance(false)
    }
  }, [])

  // Load Balance Sheet
  const loadBalanceSheet = useCallback(async () => {
    setLoadingFinance(true)
    try {
      const data = await api.finance.balanceSheet()
      setBalanceSheetData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingFinance(false)
    }
  }, [])

  useEffect(() => {
    loadAccounts()
    if (currentTab === 'bank-accounts') {
      loadAccounts()
    } else if (currentTab === 'transactions' || currentTab === 'income' || currentTab === 'expenses') {
      loadTransactions()
    } else if (currentTab === 'general-ledger') {
      loadGeneralLedger()
    } else if (currentTab === 'profit-loss') {
      loadPnl()
    } else if (currentTab === 'balance-sheet') {
      loadBalanceSheet()
    }
  }, [currentTab, loadAccounts, loadTransactions, loadGeneralLedger, loadPnl, loadBalanceSheet])

  const handlePay = async (id: number, amount: number) => {
    try {
      await api.invoices.recordPayment(id, amount)
      showToast('Payment recorded successfully!')
      onRefresh()
      loadAccounts()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => {
      const matchQuery = `${i.invoice_number} ${i.customer_name} ${i.status}`.toLowerCase().includes(query.toLowerCase())
      const matchStatus = statusTab === 'All' || i.status === statusTab
      return matchQuery && matchStatus
    })
  }, [invoices, query, statusTab])

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize))
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const subTabs = [
    { id: 'overview', label: 'Receivables & Invoices' },
    { id: 'bank-accounts', label: 'Cash & Bank Accounts' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'general-ledger', label: 'General Ledger' },
    { id: 'profit-loss', label: 'Profit & Loss' },
    { id: 'balance-sheet', label: 'Balance Sheet' },
    { id: 'reports', label: 'Financial Ratios' },
  ]

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Workspace / Finance</p>
          <h1>Invoices & Billing</h1>
          <p className="muted">Track account receivables, payable invoices, and incoming payments.</p>
          <p className="eyebrow">Workspace / Finance & Accounting</p>
          <h1>Enterprise Treasury & Accounting</h1>
          <p className="muted">Multi-account liquidity, double-entry general ledger, and automated financial statements.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {currentTab === 'bank-accounts' && (
            <button className="button primary" onClick={() => setShowAccountModal(true)}>
              <Plus size={16} /> Add Bank / Cash Account
            </button>
          )}
          {(currentTab === 'transactions' || currentTab === 'income' || currentTab === 'expenses') && (
            <button className="button primary" onClick={() => setShowTxnModal(true)}>
              <Plus size={16} /> Record Transaction
            </button>
          )}
        </div>
      </div>

      {/* Submenu navigation bar */}
      <div className="card toolbar" style={{ padding: '8px 12px', marginBottom: 16 }}>
        <div className="tabs" style={{ border: 'none', margin: 0 }}>
          {subTabs.map(t => (
            <button
              key={t.id}
              className={currentTab === t.id ? 'active' : ''}
              onClick={() => {
                setCurrentTab(t.id)
                if (onSelectSubmenu) onSelectSubmenu(t.id)
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. CASH & BANK ACCOUNTS (PHASE 3D) */}
      {currentTab === 'bank-accounts' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {accounts.map(a => (
              <div key={a.id} className="card" style={{ padding: 18, borderLeft: `4px solid ${a.type === 'Cash' ? '#10b981' : a.type === 'Mobile Banking' ? '#ec4899' : '#6c63ff'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{a.name}</h3>
                  <span className="status-badge paid">{a.type}</span>
                </div>
                <p className="muted" style={{ margin: '6px 0 12px 0', fontSize: 13 }}>
                  A/C: <b>{a.account_number}</b> {a.branch ? `• ${a.branch}` : ''}
                </p>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1e1b4b' }}>
                  ৳{Number(a.balance).toLocaleString()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginTop: 10 }}>
                  <span>{a.bank_name}</span>
                  <span>{a.transactions_count || 0} Transactions</span>
                </div>
              </div>
            ))}
          </div>

          <section className="card table-card">
            <div className="card-heading">
              <div>
                <h2>Liquidity Accounts Master Register</h2>
                <p className="muted">Authorized bank branches, mobile financial services, and cash vaults.</p>
              </div>
              <button className="button primary" onClick={() => setShowAccountModal(true)}>
                <Plus size={16} /> New Liquidity Channel
              </button>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Account Title</th>
                    <th>Institution</th>
                    <th>Account Number</th>
                    <th>Branch</th>
                    <th>Channel Type</th>
                    <th>Current Balance (BDT)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(a => (
                    <tr key={a.id}>
                      <td className="strong">{a.name}</td>
                      <td>{a.bank_name}</td>
                      <td className="muted">{a.account_number}</td>
                      <td>{a.branch || 'Principal'}</td>
                      <td><span className="status-badge in-stock">{a.type}</span></td>
                      <td className="strong" style={{ color: '#16a34a' }}>৳{Number(a.balance).toLocaleString()}</td>
                      <td><span className="status-badge paid">{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 2. TRANSACTIONS LEDGER (PHASE 3D) */}
      {(currentTab === 'transactions' || currentTab === 'income' || currentTab === 'expenses') && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card toolbar">
            <div className="tabs">
              {(['All', 'Income', 'Expense'] as const).map(tab => (
                <button
                  key={tab}
                  className={txnFilter === tab ? 'active' : ''}
                  onClick={() => setTxnFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="button primary" onClick={() => setShowTxnModal(true)}>
              <Plus size={16} /> Record Transaction
            </button>
          </div>

          <section className="card table-card">
            <div className="card-heading">
              <div>
                <h2>Finance Transaction Journal ({transactions.length} records)</h2>
                <p className="muted">Direct bank ledger entries and operating cash movements.</p>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Txn Number</th>
                    <th>Date</th>
                    <th>Liquidity Account</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount (BDT)</th>
                    <th>Payment Mode</th>
                    <th>Particulars</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingFinance ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>Loading transactions...</td></tr>
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>No transactions recorded yet. Click "Record Transaction" above.</td></tr>
                  ) : (
                    transactions
                      .filter(t => txnFilter === 'All' || t.type === txnFilter)
                      .map(t => (
                        <tr key={t.id}>
                          <td className="strong">{t.transaction_number}</td>
                          <td className="muted">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                          <td>{t.account?.name || 'Bank A/C'}</td>
                          <td className="strong">{t.category}</td>
                          <td>
                            <span className={`status-badge ${t.type === 'Income' ? 'in-stock' : 'out-of-stock'}`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="strong" style={{ color: t.type === 'Income' ? '#16a34a' : '#dc2626' }}>
                            {t.type === 'Income' ? '+' : '-'}৳{Number(t.amount).toLocaleString()}
                          </td>
                          <td className="muted">{t.payment_method}</td>
                          <td className="muted">{t.description || '—'}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 3. DOUBLE-ENTRY GENERAL LEDGER (PHASE 3D) */}
      {currentTab === 'general-ledger' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ padding: '14px 20px', background: ledgerData?.summary?.is_balanced ? '#f0fdf4' : '#fef2f2', border: `1px solid ${ledgerData?.summary?.is_balanced ? '#bbf7d0' : '#fecaca'}`, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <b style={{ color: ledgerData?.summary?.is_balanced ? '#166534' : '#991b1b', fontSize: 16 }}>
                {ledgerData?.summary?.is_balanced ? '✓ Double-Entry Books Balanced' : '⚠ Ledger Imbalance Detected'}
              </b>
              <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>
                Every debit has a corresponding credit according to standard accounting principles.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 20, textAlign: 'right' }}>
              <div>
                <span style={{ fontSize: 12, color: '#64748b' }}>Total Debits</span>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1e1b4b' }}>
                  ৳{Number(ledgerData?.summary?.total_debit || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: '#64748b' }}>Total Credits</span>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1e1b4b' }}>
                  ৳{Number(ledgerData?.summary?.total_credit || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <section className="card table-card">
            <div className="card-heading">
              <div>
                <h2>General Ledger Journal Entries ({ledgerData?.entries?.length || 0})</h2>
                <p className="muted">Immutable double-entry debit and credit audit log.</p>
              </div>
              <button className="button secondary" onClick={loadGeneralLedger}>
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Entry #</th>
                    <th>Date</th>
                    <th>Account Title</th>
                    <th>Reference</th>
                    <th>Debit (৳)</th>
                    <th>Credit (৳)</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingFinance ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>Loading general ledger...</td></tr>
                  ) : !ledgerData?.entries || ledgerData.entries.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>No journal entries found. Disburse a payroll or record a transaction to generate entries.</td></tr>
                  ) : (
                    ledgerData.entries.map((je: any) => (
                      <tr key={je.id}>
                        <td className="strong">{je.entry_number}</td>
                        <td className="muted">{new Date(je.date).toLocaleDateString('en-GB')}</td>
                        <td className="strong">{je.account_name}</td>
                        <td className="muted">{je.reference || '—'}</td>
                        <td className="strong" style={{ color: Number(je.debit) > 0 ? '#16a34a' : '#94a3b8' }}>
                          {Number(je.debit) > 0 ? `৳${Number(je.debit).toLocaleString()}` : '—'}
                        </td>
                        <td className="strong" style={{ color: Number(je.credit) > 0 ? '#4338ca' : '#94a3b8' }}>
                          {Number(je.credit) > 0 ? `৳${Number(je.credit).toLocaleString()}` : '—'}
                        </td>
                        <td className="muted">{je.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 4. PROFIT & LOSS STATEMENT (PHASE 3D) */}
      {currentTab === 'profit-loss' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card" style={{ maxWidth: 800, margin: '0 auto', width: '100%', padding: 28 }}>
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0 }}>NS ERP / Aster Trading Ltd.</h2>
                  <h3 style={{ margin: '4px 0 0 0', color: '#6c63ff' }}>Statement of Profit and Loss (Income Statement)</h3>
                  <p className="muted" style={{ margin: '2px 0 0 0', fontSize: 13 }}>Period: {pnlData?.period || 'Fiscal Year 2026'} | Currency: Bangladeshi Taka (BDT)</p>
                </div>
                <button className="button secondary" onClick={() => window.print()}>
                  <Printer size={15} /> Print Statement
                </button>
              </div>
            </div>

            {/* Revenue */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>Gross Sales & Order Revenue</span>
                <b>৳{Number(pnlData?.revenue?.gross_sales || 0).toLocaleString()}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>Less: Sales Returns & Allowances</span>
                <span style={{ color: '#dc2626' }}>-৳{Number(pnlData?.revenue?.returns_allowances || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 'bold', fontSize: 15, background: '#f8fafc' }}>
                <span>Net Operating Revenue</span>
                <span>৳{Number(pnlData?.revenue?.net_revenue || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost of Goods Sold (COGS)</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>Direct Product Procurement Costs</span>
                <b>৳{Number(pnlData?.cogs?.total_cogs || 0).toLocaleString()}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 'bold', fontSize: 15, background: '#f8fafc' }}>
                <span>Total Cost of Goods Sold</span>
                <span style={{ color: '#dc2626' }}>৳{Number(pnlData?.cogs?.total_cogs || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div style={{ padding: '12px 16px', background: '#eef2ff', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <b style={{ fontSize: 16, color: '#3730a3' }}>Gross Profit</b>
                <span className="muted" style={{ marginLeft: 8, fontSize: 13 }}>(Margin: {pnlData?.gross_margin_percent || 0}%)</span>
              </div>
              <span style={{ fontSize: 20, fontWeight: 'bold', color: '#4338ca' }}>
                ৳{Number(pnlData?.gross_profit || 0).toLocaleString()}
              </span>
            </div>

            {/* Operating Expenses */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operating Expenses</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>Workforce Payroll & Salaries</span>
                <b>৳{Number(pnlData?.operating_expenses?.payroll_salaries || 0).toLocaleString()}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>General Operating Expenses (Utilities, Rent, Logistics)</span>
                <b>৳{Number(pnlData?.operating_expenses?.general_expenses || 0).toLocaleString()}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 'bold', fontSize: 15, background: '#f8fafc' }}>
                <span>Total Operating Expenses</span>
                <span style={{ color: '#dc2626' }}>৳{Number(pnlData?.operating_expenses?.total_operating_expenses || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Net Profit */}
            <div style={{ padding: '16px 20px', background: Number(pnlData?.net_profit || 0) >= 0 ? '#f0fdf4' : '#fef2f2', border: `2px solid ${Number(pnlData?.net_profit || 0) >= 0 ? '#86efac' : '#fca5a5'}`, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b style={{ fontSize: 18, color: Number(pnlData?.net_profit || 0) >= 0 ? '#166534' : '#991b1b' }}>Net Operating Profit</b>
                <span className="muted" style={{ marginLeft: 8, fontSize: 13 }}>(Net Margin: {pnlData?.net_margin_percent || 0}%)</span>
              </div>
              <span style={{ fontSize: 24, fontWeight: 'bold', color: Number(pnlData?.net_profit || 0) >= 0 ? '#15803d' : '#b91c1c' }}>
                ৳{Number(pnlData?.net_profit || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. BALANCE SHEET (PHASE 3D) */}
      {currentTab === 'balance-sheet' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card" style={{ maxWidth: 840, margin: '0 auto', width: '100%', padding: 28 }}>
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0 }}>NS ERP / Aster Trading Ltd.</h2>
                  <h3 style={{ margin: '4px 0 0 0', color: '#6c63ff' }}>Statement of Financial Position (Balance Sheet)</h3>
                  <p className="muted" style={{ margin: '2px 0 0 0', fontSize: 13 }}>As of {balanceSheetData?.as_of_date || 'Today'} | Currency: BDT</p>
                </div>
                <button className="button secondary" onClick={() => window.print()}>
                  <Printer size={15} /> Print Balance Sheet
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Assets */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#16a34a', borderBottom: '2px solid #bbf7d0', paddingBottom: 6 }}>
                  Assets (Current & Operating)
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Cash & Bank Balances</span>
                  <b>৳{Number(balanceSheetData?.assets?.cash_and_bank || 0).toLocaleString()}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Accounts Receivable</span>
                  <b>৳{Number(balanceSheetData?.assets?.accounts_receivable || 0).toLocaleString()}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Inventory Valuation (Cost Basis)</span>
                  <b>৳{Number(balanceSheetData?.assets?.inventory_valuation || 0).toLocaleString()}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 8px', fontWeight: 'bold', fontSize: 16, background: '#f0fdf4', marginTop: 16, borderRadius: 6 }}>
                  <span>Total Assets</span>
                  <span style={{ color: '#15803d' }}>৳{Number(balanceSheetData?.assets?.total_current_assets || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Liabilities & Equity */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#dc2626', borderBottom: '2px solid #fecaca', paddingBottom: 6 }}>
                  Liabilities & Equity
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Accounts Payable (Vendor POs)</span>
                  <b>৳{Number(balanceSheetData?.liabilities?.accounts_payable || 0).toLocaleString()}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Total Liabilities</span>
                  <b>৳{Number(balanceSheetData?.liabilities?.total_liabilities || 0).toLocaleString()}</b>
                </div>

                <h4 style={{ margin: '20px 0 12px 0', color: '#6366f1', borderBottom: '2px solid #c7d2fe', paddingBottom: 6 }}>
                  Shareholders' Equity
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Retained Earnings / Equity</span>
                  <b>৳{Number(balanceSheetData?.equity?.retained_earnings || 0).toLocaleString()}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 8px', fontWeight: 'bold', fontSize: 16, background: '#eef2ff', marginTop: 16, borderRadius: 6 }}>
                  <span>Total Liabilities & Equity</span>
                  <span style={{ color: '#4338ca' }}>৳{Number(balanceSheetData?.total_liabilities_and_equity || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. FINANCIAL RATIOS SUBMENU */}
      {currentTab === 'reports' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="stats-grid">
            <StatCard title="Gross Profit Margin" value="42.8%" change={1.5} icon={Percent} tone="green" />
            <StatCard title="Operating Expense Ratio" value="28.4%" change={-2.1} icon={Scale} tone="purple" />
            <StatCard title="Current Ratio (Liquidity)" value="4.8x" change={0.3} icon={TrendingUp} tone="blue" />
            <StatCard title="Accounts Receivable Days" value="18 Days" change={-4.0} icon={Calendar} tone="orange" />
          </div>
        </div>
      )}

      {/* 7. RECEIVABLES & INVOICES (DEFAULT / OVERVIEW) */}
      {(currentTab === 'overview' || currentTab === 'receivable') && (
        <>
          <div className="card toolbar">
            <div className="search-field">
              <Search size={17} />
              <input
                placeholder="Search invoices by number, client, status..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            <div className="tabs">
              {(['All', 'Paid', 'Unpaid', 'Overdue', 'Partially paid'] as const).map(tab => (
                <button
                  key={tab}
                  className={statusTab === tab ? 'active' : ''}
                  onClick={() => {
                    setStatusTab(tab)
                    setCurrentPage(1)
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <section className="card table-card">
            <div className="card-heading">
              <div>
                <h2>Invoices & Accounts Receivable ({filteredInvoices.length})</h2>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="strong">{inv.invoice_number}</td>
                      <td>{inv.customer_name}</td>
                      <td className="muted">{inv.date}</td>
                      <td className="muted">{inv.due_date}</td>
                      <td className="strong">৳{Number(inv.total_amount).toLocaleString()}</td>
                      <td className="muted">৳{Number(inv.paid_amount).toLocaleString()}</td>
                      <td><StatusBadge>{inv.status}</StatusBadge></td>
                      <td>
                        {inv.status !== 'Paid' && (
                          <button
                            className="button secondary"
                            style={{ padding: '4px 10px', fontSize: 12 }}
                            onClick={() => handlePay(inv.id, inv.total_amount - inv.paid_amount)}
                          >
                            Collect Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>Showing {filteredInvoices.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredInvoices.length)} of {filteredInvoices.length}</span>
              <div>
                <button className="icon-button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className="icon-button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Modals */}
      {showAccountModal && (
        <CreateBankAccountModal
          onClose={() => setShowAccountModal(false)}
          onSuccess={() => {
            setShowAccountModal(false)
            loadAccounts()
            showToast('Bank / cash account added!')
          }}
        />
      )}

      {showTxnModal && (
        <CreateTransactionModal
          accounts={accounts}
          onClose={() => setShowTxnModal(false)}
          onSuccess={() => {
            setShowTxnModal(false)
            loadTransactions()
            loadAccounts()
            showToast('Transaction posted and ledger updated!')
          }}
        />
      )}
    </div>
  )
}

/* ========================================================================= */
/* ANALYTICS VIEW (WITH WORKING YEAR TOGGLE & CSV EXPORT)                    */
/* ========================================================================= */

function AnalyticsView({ stats, showToast }: { stats: any; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [selectedYear, setSelectedYear] = useState('2026')

  const series = useMemo(() => {
    if (selectedYear === '2025') {
      return fullYearData.map(d => ({ ...d, revenue: Math.round(d.revenue * 0.78), orders: Math.round(d.orders * 0.8) }))
    }
    return fullYearData
  }, [selectedYear])

  const handleExportCSV = () => {
    const headers = ['Month', 'Revenue (BDT)', 'Orders Volume']
    const rows = series.map(d => [d.label, d.revenue, d.orders])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `ns-erp-report-${selectedYear}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Exported ${selectedYear} CSV Report!`)
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Insights / Analytics</p>
          <h1>Business Performance & Metrics</h1>
          <p className="muted">Deep-dive into sales volumes, conversion rates, and revenue drivers.</p>
        </div>
        <button className="button secondary" onClick={handleExportCSV}>
          <Download size={15} /> Export CSV report
        </button>
      </div>

      <div className="stat-grid">
        <StatCard title="Conversion rate" value={selectedYear === '2026' ? '4.82%' : '4.10%'} change={2.4} icon={TrendingUp} tone="purple" />
        <StatCard title="Avg. order value" value={selectedYear === '2026' ? '৳3,663' : '৳3,120'} change={6.8} icon={ShoppingCart} tone="blue" />
        <StatCard title="Customer retention" value="78.4%" change={4.1} icon={Users} tone="green" />
        <StatCard title="Operating margin" value="30.3%" change={5.6} icon={BarChart3} tone="orange" />
      </div>

      <section className="card chart-card">
        <div className="card-heading">
          <div>
            <h2>Revenue vs Orders volume</h2>
            <p className="muted">Monthly comparison for fiscal year {selectedYear}</p>
          </div>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="2026">Year 2026</option>
            <option value="2025">Year 2025</option>
          </select>
        </div>
        <div className="chart">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={series}>
              <CartesianGrid stroke="#eef0f5" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `৳${v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${v / 1000}k`}`}
              />
              <Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#6c63ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

/* ========================================================================= */
/* SETTINGS VIEW (ENTERPRISE GRADE: 11 SUBMENUS, LIVE DB, RBAC, AUDIT TRAIL) */
/* ========================================================================= */

function SettingsView({
  settings,
  activeSubmenu = 'company',
  onSelectSubmenu,
  darkMode,
  setDarkMode,
  showToast,
}: {
  settings: Record<string, string>
  activeSubmenu?: string
  onSelectSubmenu?: (sub: string) => void
  darkMode: boolean
  setDarkMode: (v: boolean) => void
  showToast: (m: string, t?: 'success' | 'error') => void
}) {
  const [currentTab, setCurrentTab] = useState(activeSubmenu || 'company')
  
  useEffect(() => {
    if (activeSubmenu) {
      setCurrentTab(activeSubmenu)
    }
  }, [activeSubmenu])

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId)
    onSelectSubmenu?.(tabId)
  }

  // Company Profile state
  const [workspaceName, setWorkspaceName] = useState(settings.workspace_name || 'NS Enterprise')
  const [companyName, setCompanyName] = useState(settings.company_name || 'Aster Trading Ltd.')
  const [tradeLicense, setTradeLicense] = useState('TR-DHK-2026-98124')
  const [taxId, setTaxId] = useState('482910481928')
  const [binNumber, setBinNumber] = useState('002918274-0101')
  const [phone, setPhone] = useState('+880 1711-000000')
  const [email, setEmail] = useState('contact@nserp.com')
  const [address, setAddress] = useState('Level 12, Gulshan Avenue, Dhaka-1212, Bangladesh')
  const [timezone, setTimezone] = useState(settings.timezone || 'UTC+06:00 · Dhaka')
  const [currency, setCurrency] = useState(settings.currency || 'BDT')
  const [saving, setSaving] = useState(false)
  const [pingStatus, setPingStatus] = useState<string | null>(null)

  // Invoice configuration state
  const [invoicePrefix, setInvoicePrefix] = useState('INV-')
  const [quotePrefix, setQuotePrefix] = useState('QT-')
  const [poPrefix, setPoPrefix] = useState('PO-')
  const [paymentTerms, setPaymentTerms] = useState('Net 30 days')
  const [invoiceFooter, setInvoiceFooter] = useState('Thank you for choosing NS ERP! Goods once sold can only be returned within 7 days with original receipt.')
  const [receiptFormat, setReceiptFormat] = useState<'A4' | 'Thermal'>('A4')
  const [showLogoOnInvoice, setShowLogoOnInvoice] = useState(true)

  // Notification preferences
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [stockAlerts, setStockAlerts] = useState(true)
  const [dailyDigest, setDailyDigest] = useState(false)
  const [orderAlerts, setOrderAlerts] = useState(true)

  // Live Backend Data
  const [rolesData, setRolesData] = useState<{ roles: any[]; permissions: any[]; users: any[] } | null>(null)
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [taxRates, setTaxRates] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [auditModuleFilter, setAuditModuleFilter] = useState('All')
  const [auditSearch, setAuditSearch] = useState('')
  const [loadingData, setLoadingData] = useState(false)

  // Modals state
  const [showAddWarehouse, setShowAddWarehouse] = useState(false)
  const [showAddTaxRate, setShowAddTaxRate] = useState(false)
  const [showInviteUser, setShowInviteUser] = useState(false)
  const [selectedStaffUser, setSelectedStaffUser] = useState<any | null>(null)

  const loadBackendData = useCallback(async () => {
    setLoadingData(true)
    try {
      const [rData, wData, tData, aData] = await Promise.all([
        api.roles.list().catch(() => null),
        api.warehouses.list().catch(() => []),
        api.taxRates.list().catch(() => []),
        api.auditLogs.list().catch(() => []),
      ])
      if (rData) setRolesData(rData)
      if (wData) setWarehouses(wData)
      if (tData) setTaxRates(tData)
      if (aData) setAuditLogs(aData)
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    loadBackendData()
  }, [loadBackendData])

  const handleRefreshAuditLogs = async () => {
    try {
      const params: any = {}
      if (auditModuleFilter !== 'All') params.module = auditModuleFilter
      if (auditSearch) params.search = auditSearch
      const data = await api.auditLogs.list(params)
      setAuditLogs(data)
      showToast('Audit trail refreshed')
    } catch {
      showToast('Failed to fetch audit logs', 'error')
    }
  }

  const handleSaveCompany = async () => {
    setSaving(true)
    try {
      await api.settings.update({
        workspace_name: workspaceName,
        company_name: companyName,
        trade_license: tradeLicense,
        tax_id: taxId,
        bin_number: binNumber,
        phone,
        email,
        address,
        timezone,
        currency,
        dark_mode: darkMode,
      })
      await api.auditLogs.create({
        action: 'Company Profile Updated',
        module: 'Settings',
        record_reference: 'SETT-PROFILE',
        details: `Updated company legal parameters for '${companyName}' (${workspaceName}).`,
      })
      showToast('Company profile saved to backend database!')
      loadBackendData()
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveInvoiceSettings = async () => {
    try {
      await api.auditLogs.create({
        action: 'Invoice Settings Updated',
        module: 'Settings',
        record_reference: 'SETT-INV',
        details: `Updated prefixes: Inv=${invoicePrefix}, Quote=${quotePrefix}, PO=${poPrefix}, Format=${receiptFormat}`,
      })
      showToast('Invoice & receipt configuration saved!')
    } catch {
      showToast('Failed to update invoice settings', 'error')
    }
  }

  const handleTestConnection = async () => {
    setPingStatus('Testing connection...')
    const t0 = performance.now()
    try {
      await api.dashboard.stats()
      const t1 = performance.now()
      setPingStatus(`Connected! Ping latency: ${Math.round(t1 - t0)}ms`)
      showToast('Backend connection verified successfully!')
    } catch {
      setPingStatus('Connection failed. Backend is offline.')
      showToast('Connection failed', 'error')
    }
  }

  const settingsSubmenus = [
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'users-roles', label: 'Users & Roles', icon: Users },
    { id: 'permissions', label: 'Permissions Matrix', icon: ShieldCheck },
    { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
    { id: 'currency', label: 'Currency & Localization', icon: DollarSign },
    { id: 'taxes', label: 'Tax Settings', icon: Percent },
    { id: 'invoice-settings', label: 'Invoice Settings', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Access', icon: Lock },
    { id: 'audit-logs', label: 'Audit Logs', icon: History },
    { id: 'preferences', label: 'System Preferences', icon: Sliders },
  ]

  const permMatrix = [
    { module: 'Dashboard', desc: 'Executive metrics, revenue chart & KPI overview', admin: 'Full', manager: 'Read & Write', acct: 'Read Only', staff: 'Assigned KPIs', emp: 'Self' },
    { module: 'Sales', desc: 'Quotations, POS sales, invoicing & customer billing', admin: 'Full', manager: 'Full', acct: 'Read Only', staff: 'Configurable', emp: 'None' },
    { module: 'Inventory', desc: 'Stock quantities, warehouses, transfers & audit adjust', admin: 'Full', manager: 'Full', acct: 'Read Only', staff: 'Configurable', emp: 'None' },
    { module: 'Products', desc: 'Product catalog, SKU, categories, prices & units', admin: 'Full', manager: 'Full', acct: 'Read Only', staff: 'Configurable', emp: 'None' },
    { module: 'Purchases', desc: 'Purchase orders, supplier directory & goods receiving', admin: 'Full', manager: 'Full', acct: 'Read Only', staff: 'Configurable', emp: 'None' },
    { module: 'Customers', desc: 'Customer accounts, contact directory & ledger', admin: 'Full', manager: 'Full', acct: 'Read & Write', staff: 'Configurable', emp: 'None' },
    { module: 'Employees', desc: 'Staff directory, payroll runs, attendance & leaves', admin: 'Full', manager: 'Read & Write', acct: 'Read Only', staff: 'Configurable', emp: 'Self' },
    { module: 'Finance', desc: 'Accounts receivable/payable, P&L, ledger & expenses', admin: 'Full', manager: 'Read & Write', acct: 'Full', staff: 'None', emp: 'None' },
    { module: 'Analytics', desc: 'Executive BI dashboards, channel breakdown & export', admin: 'Full', manager: 'Full', acct: 'Full', staff: 'Read Only', emp: 'None' },
    { module: 'Settings', desc: 'Company profile, RBAC roles, audit logs & system config', admin: 'Full', manager: 'Read Only', acct: 'None', staff: 'None', emp: 'None' },
  ]

  const renderBadge = (perm: string) => {
    if (perm === 'Full') return <span className="badge-perm-full">Full</span>
    if (perm === 'Read & Write') return <span className="badge-perm-read">R/W</span>
    if (perm === 'Read Only') return <span className="badge-perm-read" style={{ background: '#f0f9ff', color: '#0284c7' }}>Read</span>
    if (perm === 'Self') return <span className="badge-perm-read" style={{ background: '#faf5ff', color: '#7e22ce' }}>Self</span>
    return <span className="badge-perm-none">—</span>
  }

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchMod = auditModuleFilter === 'All' || log.module === auditModuleFilter
      const matchSearch = !auditSearch || `${log.user_name} ${log.action} ${log.details} ${log.record_reference}`.toLowerCase().includes(auditSearch.toLowerCase())
      return matchMod && matchSearch
    })
  }, [auditLogs, auditModuleFilter, auditSearch])

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Workspace / Settings</p>
          <h1>Enterprise Settings & Configuration</h1>
          <p className="muted">Role-based access control, company profiles, warehouses, taxation, and immutable audit logs.</p>
        </div>
      </div>

      <div className="settings-container">
        {/* Navigation Sidebar */}
        <div className="settings-menu-list">
          {settingsSubmenus.map((sub) => {
            const Icon = sub.icon
            const isActive = currentTab === sub.id
            return (
              <button
                key={sub.id}
                className={`settings-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleTabChange(sub.id)}
              >
                <Icon size={16} />
                <span>{sub.label}</span>
              </button>
            )
          })}
        </div>

        {/* Settings Panel Content */}
        <section className="card settings-panel" style={{ maxWidth: '100%' }}>
          {/* 1. COMPANY PROFILE */}
          {currentTab === 'company' && (
            <div>
              <div className="card-heading">
                <div>
                  <h2>Company Legal Profile</h2>
                  <p className="muted">Configure your registered company credentials, tax identity, and business HQ.</p>
                </div>
              </div>

              <div className="profile-form">
                <label>
                  Workspace Name
                  <input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
                </label>
                <label>
                  Company Legal Entity Name
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </label>
              </div>

              <div className="profile-form">
                <label>
                  Trade License / Business Registration Number
                  <input value={tradeLicense} onChange={(e) => setTradeLicense(e.target.value)} />
                </label>
                <label>
                  Tax Identification Number (TIN)
                  <input value={taxId} onChange={(e) => setTaxId(e.target.value)} />
                </label>
              </div>

              <div className="profile-form">
                <label>
                  Business Identification Number (BIN / VAT)
                  <input value={binNumber} onChange={(e) => setBinNumber(e.target.value)} />
                </label>
                <label>
                  Official Phone
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
              </div>

              <div className="profile-form">
                <label>
                  Official Corporate Email
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label>
                  Default Operating Currency
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="BDT">BDT (৳) - Bangladeshi Taka (Default)</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                  </select>
                </label>
              </div>

              <div style={{ margin: '14px 0' }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 11, fontWeight: 600 }}>
                  Registered Corporate Headquarters Address
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--app-border)', background: 'var(--app-surface)', color: 'var(--app-text)', fontSize: 12 }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button className="button primary" onClick={handleSaveCompany} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Company Profile'}
                </button>
              </div>
            </div>
          )}

          {/* 2. USERS & ROLES */}
          {currentTab === 'users-roles' && (
            <div>
              <div className="card-heading">
                <div>
                  <h2>Users & Access Management</h2>
                  <p className="muted">Manage system users, assigned administrative privileges, and security roles.</p>
                </div>
                <button className="button primary" onClick={() => setShowInviteUser(true)}>
                  <Plus size={15} /> Invite User
                </button>
              </div>

              <div className="table-scroll" style={{ marginTop: 16 }}>
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Assigned Role</th>
                      <th>Module Access</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(rolesData?.users || [
                      { id: 1, name: 'Md. Nazmus Shakib', email: 'shakib@nserp.com', role: 'Company Admin', workspace: 'NS ERP / Aster Trading Ltd.', status: 'Active', initials: 'NS' },
                      { id: 2, name: 'Arif Rahman', email: 'manager@nserp.com', role: 'Manager', workspace: 'NS ERP / Aster Trading Ltd.', status: 'Active', initials: 'AR' },
                      { id: 3, name: 'Kamrul Hasan', email: 'accountant@nserp.com', role: 'Accountant', workspace: 'NS ERP / Aster Trading Ltd.', status: 'Active', initials: 'KH' },
                      { id: 4, name: 'Tanvir Ahmed', email: 'staff@nserp.com', role: 'Staff', allowed_modules: ['Sales', 'Inventory', 'Products', 'Purchases'], workspace: 'NS ERP / Aster Trading Ltd.', status: 'Active', initials: 'TA' },
                      { id: 5, name: 'Rahim Uddin', email: 'employee@nserp.com', role: 'Employee', allowed_modules: ['Employees'], workspace: 'NS ERP / Aster Trading Ltd.', status: 'Active', initials: 'RU' },
                    ]).map((u: any) => (
                      <tr key={u.id}>
                        <td>
                          <div className="person-cell">
                            <div className="avatar small" style={{ background: '#6c63ff', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>
                              {u.initials || u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <b>{u.name}</b>
                            </div>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className="role-pill" style={{ background: '#f0efff', color: '#6c63ff', fontWeight: 600 }}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.role === 'Company Admin' ? (
                            <span className="badge-perm-full">All 10 Modules</span>
                          ) : u.role === 'Manager' ? (
                            <span className="badge-perm-read">Operations & Approvals</span>
                          ) : u.role === 'Accountant' ? (
                            <span className="badge-perm-read" style={{ background: '#f0fdf4', color: '#16a34a' }}>Finance & Invoices</span>
                          ) : u.role === 'Employee' ? (
                            <span className="badge-perm-read" style={{ background: '#faf5ff', color: '#7e22ce' }}>Self-Service</span>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {(u.allowed_modules && u.allowed_modules.length > 0 ? u.allowed_modules : ['Sales', 'Inventory']).map((m: string) => (
                                <span key={m} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#f0efff', color: '#6c63ff', fontWeight: 500 }}>
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge-active">Active</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="button outline small"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => setSelectedStaffUser(u)}
                            title="Configure module access & action rights"
                          >
                            <Sliders size={12} style={{ marginRight: 4 }} /> Configure
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 13, margin: 0 }}>Primary Company Roles (5 Core Roles)</h3>
                  <span style={{ fontSize: 11, color: 'var(--app-muted)' }}>Super Admin kept separate in SaaS platform</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {(rolesData?.roles?.filter((r: any) => r.slug !== 'super_admin') || [
                    { id: 1, name: 'Company Admin', hierarchy_level: 9, description: 'Full administrative access across all business modules & configurations' },
                    { id: 2, name: 'Manager', hierarchy_level: 7, description: 'Operations management, approval workflows & module supervision' },
                    { id: 3, name: 'Accountant', hierarchy_level: 6, description: 'Financial accounting, invoices, accounts receivable/payable & ledger' },
                    { id: 4, name: 'Staff', hierarchy_level: 4, description: 'Configurable operational staff with assigned module permissions' },
                    { id: 5, name: 'Employee', hierarchy_level: 2, description: 'Self-service portal: personal profile, attendance, leave requests & payslips' },
                  ]).map((r: any) => (
                    <div key={r.id} style={{ padding: 14, borderRadius: 10, border: '1px solid var(--app-border)', background: 'var(--app-surface)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <b style={{ fontSize: 13 }}>{r.name}</b>
                        <span className="code-badge">Lvl {r.hierarchy_level}</span>
                      </div>
                      <p className="muted" style={{ fontSize: 11, margin: '8px 0 0' }}>{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. PERMISSIONS MATRIX */}
          {currentTab === 'permissions' && (
            <div>
              <div className="card-heading">
                <div>
                  <h2>Role-Based Permission Matrix (RBAC)</h2>
                  <p className="muted">Granular access rights mapped across the 5 primary company roles and 10 enterprise modules.</p>
                </div>
              </div>

              <div className="table-scroll" style={{ marginTop: 16 }}>
                <table className="permission-table">
                  <thead>
                    <tr>
                      <th style={{ width: 140 }}>Module</th>
                      <th>Company Admin</th>
                      <th>Manager</th>
                      <th>Accountant</th>
                      <th>Staff (Configurable)</th>
                      <th>Employee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permMatrix.map((row) => (
                      <tr key={row.module}>
                        <td>
                          <b>{row.module}</b>
                          <div style={{ fontSize: 10, color: 'var(--app-muted)' }}>{row.desc}</div>
                        </td>
                        <td>{renderBadge(row.admin)}</td>
                        <td>{renderBadge(row.manager)}</td>
                        <td>{renderBadge(row.acct)}</td>
                        <td>{renderBadge(row.staff)}</td>
                        <td>{renderBadge(row.emp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. WAREHOUSES */}
          {currentTab === 'warehouses' && (
            <div>
              <div className="card-heading">
                <div>
                  <h2>Central & Regional Warehouses</h2>
                  <p className="muted">Manage multi-location physical inventory depots, storage capacities, and managers.</p>
                </div>
                <button className="button primary" onClick={() => setShowAddWarehouse(true)}>
                  <Plus size={15} /> Add Warehouse
                </button>
              </div>

              <div className="warehouse-grid">
                {warehouses.map((wh) => (
                  <div key={wh.id} className="warehouse-card">
                    <div className="warehouse-card-header">
                      <div>
                        <h3>{wh.name}</h3>
                        <span className="code-badge">{wh.code}</span>
                      </div>
                      <span className="badge-active">{wh.status || 'Active'}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--app-muted)' }}>
                      📍 {wh.location} ({wh.city})
                    </div>
                    <div className="warehouse-meta-row">
                      <span>Capacity:</span>
                      <b>{wh.capacity?.toLocaleString() || 'Unlimited'} sq.ft</b>
                    </div>
                    <div className="warehouse-meta-row">
                      <span>Warehouse Manager:</span>
                      <b>{wh.manager_name || 'Admin'}</b>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. CURRENCY & LOCALIZATION */}
          {currentTab === 'currency' && (
            <div>
              <div className="card-heading">
                <div>
                  <h2>Currency & Localization</h2>
                  <p className="muted">Tailored for Bangladesh business practices with internationalization flexibility.</p>
                </div>
              </div>

              <div className="profile-form">
                <label>
                  Primary Business Currency
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="BDT">BDT (৳) - Bangladeshi Taka (Default)</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </label>
                <label>
                  Number Formatting Notation
                  <select defaultValue="lakh">
                    <option value="lakh">Bangladeshi System (1,00,000 - Lakh / Crore)</option>
                    <option value="million">International Standard (100,000 - Millions)</option>
                  </select>
                </label>
              </div>

              <div className="profile-form">
                <label>
                  Primary Operating Timezone
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    <option value="UTC+06:00 · Dhaka">Asia/Dhaka (UTC+06:00) · Dhaka Standard Time</option>
                    <option value="UTC+00:00 · London">Europe/London (UTC+00:00)</option>
                    <option value="UTC-05:00 · New York">America/New_York (UTC-05:00)</option>
                  </select>
                </label>
                <label>
                  Standard Date Format
                  <select defaultValue="DD/MM/YYYY">
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 30/10/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                  </select>
                </label>
              </div>

              <div className="profile-form">
                <label>
                  Fiscal Year Cycle Start
                  <select defaultValue="july">
                    <option value="july">July 1 (Bangladesh National Fiscal Year)</option>
                    <option value="jan">January 1 (Calendar Year)</option>
                  </select>
                </label>
                <label>
                  Currency Symbol Placement
                  <select defaultValue="prefix">
                    <option value="prefix">Prefix (৳ 1,500)</option>
                    <option value="suffix">Suffix (1,500 ৳)</option>
                  </select>
                </label>
              </div>

              <button className="button primary" onClick={() => showToast('Localization parameters updated!')}>
                Save Localization Preferences
              </button>
            </div>
          )}

          {/* 6. TAX SETTINGS */}
          {currentTab === 'taxes' && (
            <div>
              <div className="card-heading">
                <div>
                  <h2>Tax & Value Added Tax (VAT)</h2>
                  <p className="muted">National Board of Revenue (NBR) compliant VAT slabs and tax rules.</p>
                </div>
                <button className="button primary" onClick={() => setShowAddTaxRate(true)}>
                  <Plus size={15} /> Add Tax Rate
                </button>
              </div>

              <div className="table-scroll" style={{ marginTop: 16 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Tax Name</th>
                      <th>Rate (%)</th>
                      <th>Calculation Type</th>
                      <th>Default Rate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxRates.map((t) => (
                      <tr key={t.id}>
                        <td><b>{t.name}</b></td>
                        <td>{t.rate}%</td>
                        <td><span className="code-badge">{t.type}</span></td>
                        <td>
                          {t.is_default ? (
                            <span className="badge-active" style={{ background: '#e0f2fe', color: '#0369a1' }}>Default</span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td>
                          <span className="badge-active">{t.status || 'Active'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. INVOICE SETTINGS */}
          {currentTab === 'invoice-settings' && (
            <div>
              <div className="card-heading">
                <div>
                  <h2>Invoice & Billing Configuration</h2>
                  <p className="muted">Configure document prefixes, starting numbering sequences, and printable layouts.</p>
                </div>
              </div>

              <div className="profile-form">
                <label>
                  Sales Invoice Prefix
                  <input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} />
                </label>
                <label>
                  Quotation Prefix
                  <input value={quotePrefix} onChange={(e) => setQuotePrefix(e.target.value)} />
                </label>
              </div>

              <div className="profile-form">
                <label>
                  Purchase Order Prefix
                  <input value={poPrefix} onChange={(e) => setPoPrefix(e.target.value)} />
                </label>
                <label>
                  Default Payment Terms
                  <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}>
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15 days">Net 15 days</option>
                    <option value="Net 30 days">Net 30 days</option>
                    <option value="Net 60 days">Net 60 days</option>
                  </select>
                </label>
              </div>

              <div className="profile-form">
                <label>
                  Printable Invoice Layout
                  <select value={receiptFormat} onChange={(e: any) => setReceiptFormat(e.target.value)}>
                    <option value="A4">Standard A4 Enterprise Format (Laser / Inkjet)</option>
                    <option value="Thermal">80mm POS Thermal Receipt Format</option>
                  </select>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24, cursor: 'pointer' }}>
                  <input type="checkbox" checked={showLogoOnInvoice} onChange={(e) => setShowLogoOnInvoice(e.target.checked)} style={{ width: 'auto' }} />
                  <span>Display NS ERP Company Logo on Invoices</span>
                </label>
              </div>

              <div style={{ margin: '14px 0' }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 11, fontWeight: 600 }}>
                  Standard Invoice Footer Notes & Terms
                  <textarea
                    rows={3}
                    value={invoiceFooter}
                    onChange={(e) => setInvoiceFooter(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--app-border)', background: 'var(--app-surface)', color: 'var(--app-text)', fontSize: 12 }}
                  />
                </label>
              </div>

              <button className="button primary" onClick={handleSaveInvoiceSettings}>
                Save Invoice Preferences
              </button>
            </div>
          )}

          {/* 8. NOTIFICATIONS */}
          {currentTab === 'notifications' && (
            <div>
              <div className="card-heading">
                <div>
                  <h2>Notification Preferences</h2>
                  <p className="muted">Automated triggers, low stock warnings, and daily executive digests.</p>
                </div>
              </div>

              <div style={{ margin: '18px 0' }}>
                <div className="setting-row">
                  <div>
                    <b>Sales & Orders Alerts</b>
                    <p className="muted">Trigger instant notifications when a customer order is confirmed.</p>
                  </div>
                  <button className={`toggle ${orderAlerts ? 'on' : ''}`} onClick={() => setOrderAlerts(!orderAlerts)}>
                    <span />
                  </button>
                </div>

                <div className="setting-row">
                  <div>
                    <b>Low Stock Threshold Alerts</b>
                    <p className="muted">Get warned immediately when any SKU drops below minimum safety threshold.</p>
                  </div>
                  <button className={`toggle ${stockAlerts ? 'on' : ''}`} onClick={() => setStockAlerts(!stockAlerts)}>
                    <span />
                  </button>
                </div>

                <div className="setting-row">
                  <div>
                    <b>Email Dispatch on High-Value Purchases</b>
                    <p className="muted">Send email notification to managers for POs exceeding ৳ 100,000.</p>
                  </div>
                  <button className={`toggle ${emailAlerts ? 'on' : ''}`} onClick={() => setEmailAlerts(!emailAlerts)}>
                    <span />
                  </button>
                </div>

                <div className="setting-row">
                  <div>
                    <b>Executive Daily Digest</b>
                    <p className="muted">Receive an automated morning summary of daily revenue at 09:00 AM.</p>
                  </div>
                  <button className={`toggle ${dailyDigest ? 'on' : ''}`} onClick={() => setDailyDigest(!dailyDigest)}>
                    <span />
                  </button>
                </div>
              </div>

              <button className="button primary" onClick={() => showToast('Notification settings saved!')}>
                Save Preferences
              </button>
            </div>
          )}

          {/* 9. SECURITY */}
          {currentTab === 'security' && (
            <div>
              <div className="card-heading">
                <div>
                  <h2>Security & Credentials</h2>
                  <p className="muted">Sanctum API tokens, session management, and password controls.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, margin: '18px 0', maxWidth: 420 }}>
                <label>
                  Current Password
                  <input type="password" defaultValue="password" />
                </label>
                <label>
                  New Password
                  <input type="password" placeholder="Enter secure password" />
                </label>
                <label>
                  Confirm New Password
                  <input type="password" placeholder="Re-enter password" />
                </label>
              </div>

              <button className="button primary" onClick={() => showToast('Password updated successfully!')}>
                Update Password
              </button>

              <div style={{ marginTop: 28, borderTop: '1px solid var(--app-border)', paddingTop: 18 }}>
                <h3 style={{ fontSize: 13 }}>Active Laravel Sanctum Personal Access Tokens</h3>
                <p className="muted" style={{ fontSize: 11 }}>Active REST API tokens authorized to perform operations.</p>
                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, border: '1px solid var(--app-border)', background: 'var(--app-surface)' }}>
                    <div>
                      <b>NS ERP Web Session Token</b>
                      <div style={{ fontSize: 10, color: 'var(--app-muted)' }}>Bearer Token • Created: Today • Last used: Just now</div>
                    </div>
                    <span className="badge-active">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 10. AUDIT LOGS */}
          {currentTab === 'audit-logs' && (
            <div>
              <div className="card-heading">
                <div>
                  <h2>Immutable Enterprise Audit Trail</h2>
                  <p className="muted">Tamper-evident chronological log of all stock adjustments, orders, and system events.</p>
                </div>
                <button className="button secondary" onClick={handleRefreshAuditLogs}>
                  <RefreshCw size={14} /> Refresh Logs
                </button>
              </div>

              <div style={{ display: 'flex', gap: 12, margin: '16px 0', alignItems: 'center' }}>
                <div className="search-field" style={{ flex: 1 }}>
                  <Search size={15} />
                  <input
                    placeholder="Search audit trail by user, action, record, or details..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                  />
                </div>
                <select
                  value={auditModuleFilter}
                  onChange={(e) => setAuditModuleFilter(e.target.value)}
                  style={{ minHeight: 36, padding: '0 10px', borderRadius: 7, border: '1px solid var(--app-border)', background: 'var(--app-surface)', color: 'var(--app-text)', fontSize: 11 }}
                >
                  <option value="All">All Modules</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Sales">Sales</option>
                  <option value="Purchases">Purchases</option>
                  <option value="Settings">Settings</option>
                  <option value="System">System</option>
                </select>
              </div>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Module</th>
                      <th>Action</th>
                      <th>Reference</th>
                      <th>Details</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--app-muted)' }}>
                          No audit entries match the current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <tr key={log.id}>
                          <td><small>{new Date(log.created_at).toLocaleString()}</small></td>
                          <td><b>{log.user_name}</b></td>
                          <td>
                            <span className="code-badge">{log.module}</span>
                          </td>
                          <td><b>{log.action}</b></td>
                          <td><span className="code-badge" style={{ background: '#f1f5f9', color: '#475569' }}>{log.record_reference || '—'}</span></td>
                          <td><small>{log.details}</small></td>
                          <td><small className="muted">{log.ip_address || '127.0.0.1'}</small></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 11. SYSTEM PREFERENCES */}
          {currentTab === 'preferences' && (
            <div>
              <div className="card-heading">
                <div>
                  <h2>System Diagnostics & Preferences</h2>
                  <p className="muted">Backend health, REST API endpoints, and interface visual preferences.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 14, margin: '18px 0' }}>
                <label>
                  Active REST API Endpoint
                  <input value="http://127.0.0.1:8000/api" readOnly style={{ background: 'var(--app-bg)' }} />
                </label>
                <label>
                  Underlying Database Engine
                  <input value="SQLite 3.x (backend/database/database.sqlite)" readOnly style={{ background: 'var(--app-bg)' }} />
                </label>
              </div>

              <div className="setting-row">
                <div>
                  <b>Dark Appearance Mode</b>
                  <p className="muted">Enable low-light theme for reduced eye fatigue during night operations.</p>
                </div>
                <button className={`toggle ${darkMode ? 'on' : ''}`} onClick={() => setDarkMode(!darkMode)}>
                  <span />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
                <button className="button secondary" onClick={handleTestConnection}>
                  Test API Latency
                </button>
                {pingStatus && (
                  <b style={{ fontSize: 12, color: pingStatus.startsWith('Connected') ? '#10b981' : '#ef4444' }}>
                    {pingStatus}
                  </b>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Add Warehouse Modal */}
      {showAddWarehouse && (
        <AddWarehouseModal
          onClose={() => setShowAddWarehouse(false)}
          onSuccess={() => {
            loadBackendData()
            setShowAddWarehouse(false)
          }}
          showToast={showToast}
        />
      )}

      {/* Add Tax Rate Modal */}
      {showAddTaxRate && (
        <AddTaxRateModal
          onClose={() => setShowAddTaxRate(false)}
          onSuccess={() => {
            loadBackendData()
            setShowAddTaxRate(false)
          }}
          showToast={showToast}
        />
      )}

      {/* Invite User Modal */}
      {showInviteUser && (
        <InviteUserModal
          onClose={() => setShowInviteUser(false)}
          onSuccess={(newUser) => {
            if (rolesData) {
              setRolesData({
                ...rolesData,
                users: [newUser, ...rolesData.users],
              })
            }
            setShowInviteUser(false)
          }}
          showToast={showToast}
        />
      )}

      {/* Configure Staff Permissions Modal */}
      {selectedStaffUser && (
        <ConfigureStaffPermissionsModal
          user={selectedStaffUser}
          onClose={() => setSelectedStaffUser(null)}
          onSuccess={(updatedUser) => {
            if (rolesData) {
              setRolesData({
                ...rolesData,
                users: rolesData.users.map((u: any) => u.id === updatedUser.id ? updatedUser : u),
              })
            }
            setSelectedStaffUser(null)
          }}
          showToast={showToast}
        />
      )}
    </div>
  )
}

/* ========================================================================= */
/* MODALS: ADD WAREHOUSE, ADD TAX RATE, INVITE USER                          */
/* ========================================================================= */

function AddWarehouseModal({ onClose, onSuccess, showToast }: { onClose: () => void; onSuccess: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState(`WH-DHK-${Math.floor(10 + Math.random() * 89)}`)
  const [location, setLocation] = useState('')
  const [city, setCity] = useState('Dhaka')
  const [capacity, setCapacity] = useState(20000)
  const [managerName, setManagerName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !code || !location) {
      showToast('Name, code, and location are required', 'error')
      return
    }
    setSubmitting(true)
    try {
      await api.warehouses.create({
        name,
        code,
        location,
        city,
        capacity,
        manager_name: managerName || 'Admin Assigned',
        status: 'Active',
      })
      showToast(`Warehouse '${name}' provisioned successfully!`)
      onSuccess()
    } catch (err: any) {
      showToast(err.message || 'Failed to create warehouse', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 460px)' }}>
        <div className="modal-heading">
          <div>
            <h2>Add New Warehouse Depot</h2>
            <p className="muted">Provision a physical distribution center or regional hub.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={17} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Warehouse Name *
            <input placeholder="e.g. Gazipur Distribution Hub" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <div className="form-grid-2">
            <label>
              Depot Code *
              <input value={code} onChange={(e) => setCode(e.target.value)} required />
            </label>
            <label>
              City
              <input value={city} onChange={(e) => setCity(e.target.value)} />
            </label>
          </div>
          <label>
            Physical Address & Location *
            <input placeholder="e.g. Tongi Industrial Area, Gazipur" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </label>
          <div className="form-grid-2">
            <label>
              Storage Capacity (sq.ft)
              <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
            </label>
            <label>
              Warehouse Manager
              <input placeholder="e.g. Mizanur Rahman" value={managerName} onChange={(e) => setManagerName(e.target.value)} />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Provisioning...' : 'Provision Warehouse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddTaxRateModal({ onClose, onSuccess, showToast }: { onClose: () => void; onSuccess: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [name, setName] = useState('')
  const [rate, setRate] = useState(15)
  const [type, setType] = useState('percentage')
  const [isDefault, setIsDefault] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) {
      showToast('Tax name is required', 'error')
      return
    }
    setSubmitting(true)
    try {
      await api.taxRates.create({
        name,
        rate: Number(rate),
        type,
        is_default: isDefault,
        status: 'Active',
      })
      showToast(`Tax slab '${name}' (${rate}%) created!`)
      onSuccess()
    } catch (err: any) {
      showToast(err.message || 'Failed to create tax rate', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 420px)' }}>
        <div className="modal-heading">
          <div>
            <h2>Add Tax / VAT Rate</h2>
            <p className="muted">Configure a National Board of Revenue VAT slab.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={17} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Tax / VAT Name *
            <input placeholder="e.g. Supplementary Duty (SD)" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <div className="form-grid-2">
            <label>
              Rate (%) *
              <input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} required />
            </label>
            <label>
              Calculation Type
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </label>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 4 }}>
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} style={{ width: 'auto' }} />
            <span>Set as default system VAT rate</span>
          </label>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Tax Slab'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InviteUserModal({ onClose, onSuccess, showToast }: { onClose: () => void; onSuccess: (u: any) => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Staff')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) {
      showToast('Name and email are required', 'error')
      return
    }
    setSubmitting(true)
    try {
      await api.auditLogs.create({
        action: 'User Invited',
        module: 'Settings',
        record_reference: email,
        details: `Invited user ${name} (${email}) with role '${role}'.`,
      })
      onSuccess({
        id: Date.now(),
        name,
        email,
        role,
        workspace: 'NS ERP / Aster Trading Ltd.',
        initials: name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
        allowed_modules: role === 'Staff' ? ['Sales', 'Inventory', 'Products', 'Purchases'] : undefined,
        status: 'Active',
      })
      showToast(`User '${name}' invited successfully!`)
    } catch (err: any) {
      showToast(err.message || 'Failed to invite user', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 420px)' }}>
        <div className="modal-heading">
          <div>
            <h2>Invite System User</h2>
            <p className="muted">Grant system login access and assign an operational company role.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={17} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Full Name *
            <input placeholder="e.g. Farhana Islam" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Corporate Email *
            <input type="email" placeholder="e.g. farhana@nserp.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Assigned Primary Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Manager">Manager (Operations Supervision)</option>
              <option value="Accountant">Accountant (Financial Control)</option>
              <option value="Staff">Staff (Configurable Module Access)</option>
              <option value="Employee">Employee (Self-Service)</option>
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Sending Invite...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfigureStaffPermissionsModal({
  user,
  onClose,
  onSuccess,
  showToast,
}: {
  user: any
  onClose: () => void
  onSuccess: (u: any) => void
  showToast: (m: string, t?: 'success' | 'error') => void
}) {
  const [role, setRole] = useState(user.role || 'Staff')
  const [allowedModules, setAllowedModules] = useState<string[]>(
    user.allowed_modules && Array.isArray(user.allowed_modules)
      ? user.allowed_modules
      : ['Sales', 'Inventory', 'Products', 'Purchases', 'Customers']
  )
  const [permissions, setPermissions] = useState<string[]>(
    user.permissions && Array.isArray(user.permissions)
      ? user.permissions
      : ['view', 'create', 'edit', 'stock_adjustment']
  )
  const [submitting, setSubmitting] = useState(false)

  const modulesList = [
    { id: 'Sales', label: 'Sales Module' },
    { id: 'Inventory', label: 'Inventory Module' },
    { id: 'Products', label: 'Products Catalog' },
    { id: 'Purchases', label: 'Purchases Module' },
    { id: 'Customers', label: 'Customers' },
    { id: 'Employees', label: 'Employees & HR' },
    { id: 'Finance', label: 'Finance & Invoices' },
    { id: 'Analytics', label: 'Business Analytics' },
  ]

  const actionsList = [
    { id: 'view', label: 'View Records' },
    { id: 'create', label: 'Create Records' },
    { id: 'edit', label: 'Edit Records' },
    { id: 'delete', label: 'Delete Records' },
    { id: 'approve', label: 'Approve Quotes & Returns' },
    { id: 'export', label: 'Export Reports' },
    { id: 'stock_adjustment', label: 'Stock Adjustment' },
  ]

  const toggleModule = (modId: string) => {
    setAllowedModules(prev =>
      prev.includes(modId) ? prev.filter(m => m !== modId) : [...prev, modId]
    )
  }

  const toggleAction = (actId: string) => {
    setPermissions(prev =>
      prev.includes(actId) ? prev.filter(a => a !== actId) : [...prev, actId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.roles.updateUserPermissions(user.id, {
        role,
        allowed_modules: role === 'Staff' ? allowedModules : undefined,
        permissions,
      })
      showToast(`Permissions updated for ${user.name}!`)
      onSuccess(res.user || { ...user, role, allowed_modules: allowedModules, permissions })
    } catch (err: any) {
      showToast(err.message || 'Failed to update permissions', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 540px)' }}>
        <div className="modal-heading">
          <div>
            <h2>Configure User Permissions</h2>
            <p className="muted">Customize module access and operational action rights for {user.name} ({user.email}).</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={17} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <label>
            Assigned Company Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Company Admin">Company Admin (Full System Access)</option>
              <option value="Manager">Manager (Operations Supervision)</option>
              <option value="Accountant">Accountant (Financial Control)</option>
              <option value="Staff">Staff (Configurable Module Access)</option>
              <option value="Employee">Employee (Self-Service)</option>
            </select>
          </label>

          {role === 'Staff' && (
            <div>
              <label style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, display: 'block' }}>
                Authorized Sidebar Modules
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: 10, background: 'var(--app-bg)', borderRadius: 8 }}>
                {modulesList.map(m => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={allowedModules.includes(m.id)}
                      onChange={() => toggleModule(m.id)}
                      style={{ width: 'auto' }}
                    />
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, display: 'block' }}>
              Operational Action Rights
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: 10, background: 'var(--app-bg)', borderRadius: 8 }}>
              {actionsList.map(a => (
                <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={permissions.includes(a.id)}
                    onChange={() => toggleAction(a.id)}
                    style={{ width: 'auto' }}
                  />
                  <span>{a.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: 8 }}>
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save & Enforce Permissions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TransferStockModal({
  products,
  onClose,
  onSuccess,
  showToast,
}: {
  products: any[]
  onClose: () => void
  onSuccess: () => void
  showToast: (m: string, t?: 'success' | 'error') => void
}) {
  const [productId, setProductId] = useState(products[0]?.id || '')
  const selectedProduct = products.find(p => String(p.id) === String(productId))
  const [fromWarehouse, setFromWarehouse] = useState(selectedProduct?.warehouse || 'Dhaka HQ')
  const [toWarehouse, setToWarehouse] = useState('Chittagong Port Depot')
  const [quantity, setQuantity] = useState(5)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (selectedProduct?.warehouse) {
      setFromWarehouse(selectedProduct.warehouse)
    }
  }, [selectedProduct])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId || !fromWarehouse || !toWarehouse || quantity < 1) {
      showToast('Please specify product, warehouses, and valid quantity', 'error')
      return
    }
    if (fromWarehouse === toWarehouse) {
      showToast('Source and destination warehouse must be different', 'error')
      return
    }
    if (selectedProduct && selectedProduct.stock < quantity) {
      showToast(`Cannot transfer ${quantity} units. Available stock: ${selectedProduct.stock}`, 'error')
      return
    }
    setSubmitting(true)
    try {
      await api.inventory.transfer({
        product_id: productId,
        from_warehouse: fromWarehouse,
        to_warehouse: toWarehouse,
        quantity: Number(quantity),
        notes,
      })
      showToast(`Successfully transferred ${quantity} units to ${toWarehouse}!`)
      onSuccess()
    } catch (err: any) {
      showToast(err.message || 'Transfer failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 460px)' }}>
        <div className="modal-heading">
          <div>
            <h2>Transfer Stock Between Warehouses</h2>
            <p className="muted">Atomically move inventory between regional hubs with full audit tracking.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={17} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Select Product *
            <select value={productId} onChange={(e) => setProductId(e.target.value)}>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Available: {p.stock}
                </option>
              ))}
            </select>
          </label>

          <div className="form-grid-2">
            <label>
              Source Warehouse
              <input value={fromWarehouse} readOnly style={{ background: 'var(--app-bg)' }} />
            </label>
            <label>
              Destination Warehouse *
              <select value={toWarehouse} onChange={(e) => setToWarehouse(e.target.value)}>
                <option value="Dhaka HQ Central Warehouse">Dhaka HQ Central Warehouse</option>
                <option value="Chittagong Port Depot">Chittagong Port Depot</option>
                <option value="Sylhet Regional Hub">Sylhet Regional Hub</option>
                <option value="Gazipur Distribution Hub">Gazipur Distribution Hub</option>
              </select>
            </label>
          </div>

          <label>
            Transfer Quantity * (Max: {selectedProduct?.stock || 0})
            <input
              type="number"
              min={1}
              max={selectedProduct?.stock || 9999}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </label>

          <label>
            Transfer Note / Gate Pass Reference
            <input
              placeholder="e.g. Inter-depot stock rebalancing for retail demand"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Executing Transfer...' : 'Confirm Stock Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReceiveGoodsModal({
  purchase,
  products,
  onClose,
  onSuccess,
  showToast,
}: {
  purchase: any
  products: any[]
  onClose: () => void
  onSuccess: () => void
  showToast: (m: string, t?: 'success' | 'error') => void
}) {
  const remainingToReceive = Math.max(1, (purchase?.items_count || 1) - (purchase?.received_quantity || 0))
  const [quantityReceived, setQuantityReceived] = useState(remainingToReceive)
  const [warehouse, setWarehouse] = useState('Dhaka HQ Central Warehouse')
  const [productId, setProductId] = useState(products[0]?.id || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!purchase || quantityReceived < 1) {
      showToast('Valid quantity is required', 'error')
      return
    }
    setSubmitting(true)
    try {
      await api.purchases.receiveGoods(purchase.id, {
        quantity_received: Number(quantityReceived),
        warehouse,
        product_id: productId,
      })
      showToast(`Goods for ${purchase.po_number} received! Physical inventory updated.`)
      onSuccess()
    } catch (err: any) {
      showToast(err.message || 'Failed to receive goods', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 460px)' }}>
        <div className="modal-heading">
          <div>
            <h2>Goods Receiving & Physical Stock Posting</h2>
            <p className="muted">Verify shipment and post inventory to warehouse atomically.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={17} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 8, background: 'rgba(108, 99, 255, 0.08)', fontSize: 12, display: 'grid', gap: 4 }}>
            <div><b>Purchase Order:</b> {purchase?.po_number}</div>
            <div><b>Supplier:</b> {purchase?.supplier_name}</div>
            <div>
              <b>Total Ordered:</b> {purchase?.items_count} units | <b>Previously Received:</b> {purchase?.received_quantity || 0} units | <b style={{ color: '#6c63ff' }}>Remaining: {remainingToReceive} units</b>
            </div>
          </div>

          <label>
            Receiving Warehouse *
            <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
              <option value="Dhaka HQ Central Warehouse">Dhaka HQ Central Warehouse</option>
              <option value="Chittagong Port Depot">Chittagong Port Depot</option>
              <option value="Sylhet Regional Hub">Sylhet Regional Hub</option>
            </select>
          </label>

          <label>
            Target Inventory Product to Increment *
            <select value={productId} onChange={(e) => setProductId(e.target.value)}>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Current Stock: {p.stock}
                </option>
              ))}
            </select>
          </label>

          <label>
            Physical Quantity Received & Verified *
            <input
              type="number"
              min={1}
              value={quantityReceived}
              onChange={(e) => setQuantityReceived(Number(e.target.value))}
              required
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Posting Stock...' : 'Post Stock & Mark Received'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReturnSaleModal({
  sale,
  onClose,
  onSuccess,
  showToast,
}: {
  sale: any
  onClose: () => void
  onSuccess: () => void
  showToast: (m: string, t?: 'success' | 'error') => void
}) {
  const [reason, setReason] = useState('Customer changed mind / return within 7 days')
  const [restock, setRestock] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sale) return
    setSubmitting(true)
    try {
      await api.sales.processReturn(sale.id, {
        reason,
        restock,
      })
      showToast(`Sale order ${sale.order_number} processed as Returned!`)
      onSuccess()
    } catch (err: any) {
      showToast(err.message || 'Failed to process return', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 440px)' }}>
        <div className="modal-heading">
          <div>
            <h2>Process Sales Return & Restock</h2>
            <p className="muted">Record customer return, refund note, and inventory restock policy.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={17} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239, 68, 68, 0.08)', fontSize: 12 }}>
            <div><b>Order:</b> {sale?.order_number}</div>
            <div><b>Customer:</b> {sale?.customer_name}</div>
            <div><b>Total Value:</b> ৳{Number(sale?.total || 0).toLocaleString()}</div>
          </div>

          <label>
            Return Reason *
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="Customer changed mind / return within 7 days">Customer changed mind / return within 7 days</option>
              <option value="Defective or damaged product on arrival">Defective or damaged product on arrival</option>
              <option value="Wrong specification / model delivered">Wrong specification / model delivered</option>
              <option value="Order cancelled before dispatch">Order cancelled before dispatch</option>
            </select>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 4 }}>
            <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} style={{ width: 'auto' }} />
            <span>Restock returned items into inventory</span>
          </label>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting} style={{ background: '#dc2626' }}>
              {submitting ? 'Processing Return...' : 'Confirm Sales Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreateQuotationModal({
  products,
  onClose,
  onSuccess,
  showToast,
}: {
  products: any[]
  onClose: () => void
  onSuccess: (quote: any) => void
  showToast: (m: string, t?: 'success' | 'error') => void
}) {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [productId, setProductId] = useState(products[0]?.id || '')
  const selectedProduct = products.find(p => String(p.id) === String(productId))
  const [price, setPrice] = useState(selectedProduct?.price || 12000)
  const [quantity, setQuantity] = useState(1)
  const [validUntil, setValidUntil] = useState('15 days')

  useEffect(() => {
    if (selectedProduct) {
      setPrice(selectedProduct.price)
    }
  }, [selectedProduct])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName) {
      showToast('Customer name is required', 'error')
      return
    }
    const quote = {
      id: Date.now(),
      quote_number: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
      customer_name: customerName,
      customer_email: customerEmail,
      product_id: productId,
      product_name: selectedProduct?.name || 'Enterprise Service',
      price,
      quantity,
      total: price * quantity * 1.15,
      valid_until: validUntil,
      status: 'Sent',
      date: new Date().toISOString().split('T')[0],
    }
    onSuccess(quote)
    showToast(`Quotation ${quote.quote_number} generated!`)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 460px)' }}>
        <div className="modal-heading">
          <div>
            <h2>Create Price Quotation</h2>
            <p className="muted">Generate formal client proposal with VAT calculations.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={17} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Prospective Client / Company Name *
            <input placeholder="e.g. Beximco Pharma Ltd." value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </label>
          <label>
            Client Email
            <input type="email" placeholder="e.g. procurement@beximco.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
          </label>
          <label>
            Product / Item
            <select value={productId} onChange={(e) => setProductId(e.target.value)}>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (৳{p.price.toLocaleString()})</option>
              ))}
            </select>
          </label>
          <div className="form-grid-2">
            <label>
              Unit Price (৳)
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </label>
            <label>
              Quantity
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </label>
          </div>
          <label>
            Quotation Validity
            <select value={validUntil} onChange={(e) => setValidUntil(e.target.value)}>
              <option value="7 days">7 days</option>
              <option value="15 days">15 days</option>
              <option value="30 days">30 days</option>
            </select>
          </label>

          <div style={{ padding: 10, borderRadius: 8, background: 'var(--app-bg)', fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <b>৳{(price * quantity).toLocaleString()}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--app-muted)' }}>
              <span>Standard VAT (15%):</span>
              <span>৳{(price * quantity * 0.15).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--app-border)', paddingTop: 4, marginTop: 4 }}>
              <span>Estimated Total:</span>
              <span style={{ color: 'var(--app-primary)' }}>৳{(price * quantity * 1.15).toLocaleString()}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary">Generate Quotation</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ========================================================================= */
/* MODALS (CREATE, EDIT, DETAILS, RECEIPT, HELP)                             */
/* ========================================================================= */

function CreateOrderModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [customerName, setCustomerName] = useState('')
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState(12500)
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('Bank transfer')
  const [status, setStatus] = useState('Paid')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !productName) {
      alert('Please fill customer and product names')
      return
    }
    setSubmitting(true)
    try {
      await api.sales.create({
        customer_name: customerName,
        payment_method: paymentMethod,
        status,
        items: [
          {
            product_name: productName,
            price: Number(price),
            quantity: Number(quantity),
          },
        ],
      })
      onSuccess()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <h2>Create New Sale Order</h2>
            <p className="muted">Records invoice and updates inventory stock automatically.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Customer name *
            <input placeholder="e.g. Bengal Office Co." value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </label>
          <label>
            Product name *
            <input placeholder="e.g. Logitech MX Master 3S" value={productName} onChange={(e) => setProductName(e.target.value)} required />
          </label>
          <div className="form-grid-2">
            <label>
              Unit Price (৳) *
              <input type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            </label>
            <label>
              Quantity *
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
            </label>
          </div>
          <div className="form-grid-2">
            <label>
              Payment Method
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option>Bank transfer</option>
                <option>bKash</option>
                <option>Cash</option>
                <option>Card</option>
              </select>
            </label>
            <label>
              Status
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>Paid</option>
                <option>Unpaid</option>
                <option>Partial</option>
              </select>
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OrderReceiptModal({ order, onClose }: { order: any; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <h2>Invoice / Receipt</h2>
            <p className="muted">{order.order_number} · {order.date}</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="receipt-modal-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <div>
              <b style={{ display: 'block' }}>Customer:</b>
              <span>{order.customer_name}</span>
              {order.customer_email && <small className="muted" style={{ display: 'block' }}>{order.customer_email}</small>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <b style={{ display: 'block' }}>Payment Method:</b>
              <span>{order.payment_method}</span>
              <div style={{ marginTop: 4 }}><StatusBadge>{order.status}</StatusBadge></div>
            </div>
          </div>

          <table className="receipt-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((it: any, i: number) => (
                  <tr key={i}>
                    <td>{it.product_name}</td>
                    <td>{it.quantity}x</td>
                    <td style={{ textAlign: 'right' }}>৳{Number(it.subtotal || it.price * it.quantity).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>ERP Order Items</td>
                  <td>1x</td>
                  <td style={{ textAlign: 'right' }}>৳{Number(order.total).toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="receipt-total-row">
            <span>Grand Total (incl. VAT)</span>
            <span>৳{Number(order.total).toLocaleString()}</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="button primary" onClick={onClose}>Close Receipt</button>
        </div>
      </div>
    </div>
  )
}

function CreateProductModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState(() => 'NXR-' + Date.now().toString().slice(-4))
  const [category, setCategory] = useState('Electronics')
  const [price, setPrice] = useState(8500)
  const [cost, setCost] = useState(5500)
  const [stock, setStock] = useState(25)
  const [warehouse, setWarehouse] = useState('Dhaka HQ')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.products.create({
        name,
        sku,
        category,
        price: Number(price),
        cost: Number(cost),
        stock: Number(stock),
        warehouse,
      })
      onSuccess()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <h2>Add New Product</h2>
            <p className="muted">Will be saved directly to SQLite backend.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Product name *
            <input placeholder="e.g. Wireless Mechanical Keyboard" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <div className="form-grid-2">
            <label>
              SKU *
              <input value={sku} onChange={(e) => setSku(e.target.value)} required />
            </label>
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Electronics</option>
                <option>Computers</option>
                <option>Accessories</option>
                <option>Storage</option>
                <option>Office supplies</option>
              </select>
            </label>
          </div>
          <div className="form-grid-2">
            <label>
              Selling Price (৳) *
              <input type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            </label>
            <label>
              Cost (৳)
              <input type="number" min="0" value={cost} onChange={(e) => setCost(Number(e.target.value))} />
            </label>
          </div>
          <div className="form-grid-2">
            <label>
              Initial Stock *
              <input type="number" min="0" value={stock} onChange={(e) => setStock(Number(e.target.value))} required />
            </label>
            <label>
              Warehouse
              <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                <option>Dhaka HQ</option>
                <option>Chittagong</option>
                <option>Sylhet</option>
              </select>
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditProductModal({ product, onClose, onSuccess }: { product: any; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(product.name)
  const [price, setPrice] = useState(product.price)
  const [stock, setStock] = useState(product.stock)
  const [warehouse, setWarehouse] = useState(product.warehouse)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.products.update(product.id, {
        name,
        price: Number(price),
        stock: Number(stock),
        warehouse,
      })
      onSuccess()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <h2>Edit Product ({product.sku})</h2>
            <p className="muted">Update details in Laravel SQLite database.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Product name *
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <div className="form-grid-2">
            <label>
              Selling Price (৳) *
              <input type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            </label>
            <label>
              Stock on Hand *
              <input type="number" min="0" value={stock} onChange={(e) => setStock(Number(e.target.value))} required />
            </label>
          </div>
          <label>
            Warehouse
            <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
              <option>Dhaka HQ</option>
              <option>Chittagong</option>
              <option>Sylhet</option>
            </select>
          </label>
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreateCustomerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [tier, setTier] = useState('Enterprise')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.customers.create({
        name,
        email,
        company,
        tier,
        phone,
      })
      onSuccess()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <h2>Register Customer</h2>
            <p className="muted">Add a new company or client account.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Customer name *
            <input placeholder="e.g. Apex Holdings Ltd." value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email *
            <input type="email" placeholder="e.g. finance@apex.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <div className="form-grid-2">
            <label>
              Company *
              <input placeholder="e.g. Manufacturing" value={company} onChange={(e) => setCompany(e.target.value)} required />
            </label>
            <label>
              Tier
              <select value={tier} onChange={(e) => setTier(e.target.value)}>
                <option>Enterprise</option>
                <option>Business</option>
                <option>Standard</option>
              </select>
            </label>
          </div>
          <label>
            Phone
            <input placeholder="+880 1..." value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CustomerDetailsModal({ customer, onClose }: { customer: any; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <h2>Customer Profile</h2>
            <p className="muted">{customer.name} · {customer.company}</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'grid', gap: 12, margin: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="avatar" style={{ width: 42, height: 42 }}>{customer.name.charAt(0)}</span>
            <div>
              <b>{customer.name}</b>
              <small className="muted" style={{ display: 'block' }}>{customer.email}</small>
            </div>
          </div>

          <div className="profile-form" style={{ margin: '8px 0', gap: 10 }}>
            <div>
              <label>Tier</label>
              <input value={customer.tier} readOnly style={{ background: 'var(--app-bg)' }} />
            </div>
            <div>
              <label>Status</label>
              <input value={customer.status} readOnly style={{ background: 'var(--app-bg)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600 }}>Lifetime Total Spent</label>
            <p style={{ fontSize: 18, fontWeight: 700, margin: '4px 0', color: 'var(--app-primary)' }}>
              ৳{Number(customer.spent).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="button primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function CreateEmployeeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [department, setDepartment] = useState('Sales')
  const [phone, setPhone] = useState('')
  const [salary, setSalary] = useState('45000')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.employees.create({
        name,
        email,
        role,
        department,
        phone,
        salary: Number(salary),
      })
      onSuccess()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <h2>Add Team Member</h2>
            <p className="muted">HR profile and role assignment.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Full Name *
            <input placeholder="e.g. Mahfuzur Rahman" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email address *
            <input type="email" placeholder="e.g. employee@nserp.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <div className="form-grid-2">
            <label>
              Role / Position *
              <input placeholder="e.g. Logistics Officer" value={role} onChange={(e) => setRole(e.target.value)} required />
            </label>
            <label>
              Department
              <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option>Sales</option>
                <option>Inventory</option>
                <option>Finance</option>
                <option>HR</option>
                <option>IT</option>
              </select>
            </label>
          </div>
          <div className="form-grid-2">
            <label>
              Phone
              <input placeholder="+880 1..." value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label>
              Monthly Gross Salary (৳)
              <input type="number" min="0" value={salary} onChange={(e) => setSalary(e.target.value)} required />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ApplyLeaveModal({ employees, onClose, onSuccess }: { employees: any[]; onClose: () => void; onSuccess: () => void }) {
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '')
  const [leaveType, setLeaveType] = useState('Casual Leave')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.leaves.apply({
        employee_id: Number(employeeId),
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason,
      })
      onSuccess()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <h2>Apply for Leave</h2>
            <p className="muted">Submit absence request for manager authorization.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Employee *
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} — {e.role} ({e.department})</option>
              ))}
            </select>
          </label>
          <label>
            Leave Type *
            <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
              <option value="Casual Leave">Casual Leave (14 days quota)</option>
              <option value="Sick Leave">Sick Leave (10 days quota)</option>
              <option value="Annual Leave">Annual Leave (15 days quota)</option>
            </select>
          </label>
          <div className="form-grid-2">
            <label>
              Start Date *
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </label>
            <label>
              End Date *
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </label>
          </div>
          <label>
            Reason for Leave *
            <textarea
              rows={3}
              placeholder="Provide reason for absence..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6 }}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Member'}
              {submitting ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RecordAttendanceModal({ employees, onClose, onSuccess }: { employees: any[]; onClose: () => void; onSuccess: () => void }) {
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [clockIn, setClockIn] = useState('09:00')
  const [clockOut, setClockOut] = useState('18:00')
  const [status, setStatus] = useState('Present')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.attendances.record({
        employee_id: Number(employeeId),
        date,
        clock_in: clockIn,
        clock_out: clockOut,
        status,
        notes,
      })
      onSuccess()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <h2>Record Attendance</h2>
            <p className="muted">Manual entry or attendance adjustment for HR records.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Employee *
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
              ))}
            </select>
          </label>
          <div className="form-grid-2">
            <label>
              Date *
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label>
              Status *
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="On Leave">On Leave</option>
              </select>
            </label>
          </div>
          <div className="form-grid-2">
            <label>
              Clock In Time
              <input type="time" value={clockIn} onChange={(e) => setClockIn(e.target.value)} />
            </label>
            <label>
              Clock Out Time
              <input type="time" value={clockOut} onChange={(e) => setClockOut(e.target.value)} />
            </label>
          </div>
          <label>
            Notes / Justification
            <input placeholder="e.g. Approved client site visit" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PayslipModal({ payslipId, onClose }: { payslipId: number; onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.payrolls.payslip(payslipId).then(d => {
      setData(d)
      setLoading(false)
    }).catch(err => {
      alert(err.message)
      onClose()
    })
  }, [payslipId, onClose])

  if (loading || !data) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" style={{ maxWidth: 450, textAlign: 'center', padding: 40 }}>
          <p>Loading payslip details...</p>
        </div>
      </div>
    )
  }

  const { company, employee, breakdown } = data

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, color: '#6c63ff' }}>{company.name}</h2>
            <p className="muted" style={{ margin: '4px 0 0 0', fontSize: 13 }}>{company.address}</p>
            <p className="muted" style={{ margin: 0, fontSize: 12 }}>{company.bin} | {company.tin}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`status-badge ${breakdown.status === 'Paid' ? 'paid' : 'pending'}`} style={{ fontSize: 13 }}>
              {breakdown.status}
            </span>
            <p className="muted" style={{ margin: '4px 0 0 0', fontSize: 12 }}>Ref: {breakdown.reference || 'PAY-SLIP'}</p>
          </div>
        </div>

        <div style={{ margin: '16px 0', padding: 12, background: '#f8fafc', borderRadius: 8, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 13 }}>
          <div>
            <b>Employee:</b> {employee.name} ({employee.code || 'EMP'})<br />
            <b>Designation:</b> {employee.role}<br />
            <b>Department:</b> {employee.department}
          </div>
          <div>
            <b>Pay Period:</b> {breakdown.month}<br />
            <b>Payment Mode:</b> {breakdown.payment_method}<br />
            <b>Disbursement Date:</b> {breakdown.paid_date || 'Pending'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#16a34a' }}>Earnings (BDT)</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Basic Salary</span>
              <b>৳{Number(breakdown.basic_salary).toLocaleString()}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>House Rent (25%)</span>
              <span>৳{Number(breakdown.allowances.house_rent).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Medical Allowance (10%)</span>
              <span>৳{Number(breakdown.allowances.medical).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Conveyance Allowance (5%)</span>
              <span>৳{Number(breakdown.allowances.conveyance).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid #e2e8f0', paddingTop: 6, fontWeight: 'bold' }}>
              <span>Total Earnings</span>
              <span>৳{(Number(breakdown.basic_salary) + Number(breakdown.allowances.total)).toLocaleString()}</span>
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>Deductions (BDT)</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Provident Fund (5%)</span>
              <span>৳{Number(breakdown.deductions.provident_fund).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Tax / TDS</span>
              <span>৳{Number(breakdown.deductions.tax).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid #e2e8f0', paddingTop: 6, fontWeight: 'bold' }}>
              <span>Total Deductions</span>
              <span>৳{Number(breakdown.deductions.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 18px', background: '#eef2ff', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 'bold', color: '#3730a3' }}>Net Take-Home Pay:</span>
          <span style={{ fontSize: 20, fontWeight: 'bold', color: '#4338ca' }}>৳{Number(breakdown.net_salary).toLocaleString()}</span>
        </div>

        <div className="modal-actions" style={{ marginTop: 20 }}>
          <button type="button" className="button secondary" onClick={() => window.print()}>
            <Printer size={15} /> Print / Export PDF
          </button>
          <button type="button" className="button primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateTransactionModal({ accounts, onClose, onSuccess }: { accounts: any[]; onClose: () => void; onSuccess: () => void }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id || '')
  const [type, setType] = useState<'Income' | 'Expense'>('Expense')
  const [category, setCategory] = useState('Utilities')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.finance.createTransaction({
        account_id: Number(accountId),
        type,
        category,
        amount: Number(amount),
        date,
        payment_method: paymentMethod,
        description,
      })
      onSuccess()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <h2>Record Transaction</h2>
            <p className="muted">Log finance income or expense with double-entry journal update.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div className="form-grid-2">
            <label>
              Transaction Type *
              <select value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </label>
            <label>
              Account *
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} (৳{Number(a.balance).toLocaleString()})</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-grid-2">
            <label>
              Category *
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {type === 'Expense' ? (
                  <>
                    <option value="Utilities">Utilities (Electric / Internet)</option>
                    <option value="Rent">Office & Warehouse Rent</option>
                    <option value="Office Supplies">Office Supplies & Stationery</option>
                    <option value="Software">Software & Cloud Hosting</option>
                    <option value="Marketing">Marketing & Advertising</option>
                    <option value="Logistics">Logistics & Courier Delivery</option>
                    <option value="Other">Other Operating Expense</option>
                  </>
                ) : (
                  <>
                    <option value="Sales Income">Sales Income</option>
                    <option value="Consulting">Consulting & Service Fee</option>
                    <option value="Interest">Bank Interest Income</option>
                    <option value="Other">Other Income</option>
                  </>
                )}
              </select>
            </label>
            <label>
              Amount (৳) *
              <input type="number" min="1" placeholder="e.g. 15000" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </label>
          </div>
          <div className="form-grid-2">
            <label>
              Date *
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label>
              Payment Method
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option>Bank Transfer</option>
                <option>bKash Merchant</option>
                <option>Nagad</option>
                <option>Cash</option>
                <option>Cheque</option>
              </select>
            </label>
          </div>
          <label>
            Description / Particulars
            <input placeholder="e.g. DESCO Electricity bill for Oct 2026" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreateBankAccountModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [branch, setBranch] = useState('')
  const [type, setType] = useState('Bank')
  const [balance, setBalance] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.finance.createAccount({
        name,
        account_number: accountNumber,
        bank_name: bankName,
        branch,
        type,
        balance: Number(balance) || 0,
      })
      onSuccess()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <h2>Add Cash / Bank Account</h2>
            <p className="muted">Configure enterprise liquidity channels.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Account Title *
            <input placeholder="e.g. Eastern Bank Ltd. (Principal)" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <div className="form-grid-2">
            <label>
              Account Number *
              <input placeholder="e.g. 102-120-99812" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
            </label>
            <label>
              Account Type *
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Bank">Bank Account</option>
                <option value="Mobile Banking">Mobile Financial Service (bKash/Nagad)</option>
                <option value="Cash">Cash Vault / Petty Cash</option>
              </select>
            </label>
          </div>
          <div className="form-grid-2">
            <label>
              Bank / Institution Name *
              <input placeholder="e.g. Eastern Bank Ltd" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
            </label>
            <label>
              Branch Location
              <input placeholder="e.g. Dilkusha Branch" value={branch} onChange={(e) => setBranch(e.target.value)} />
            </label>
          </div>
          <label>
            Initial Opening Balance (৳) *
            <input type="number" min="0" placeholder="0.00" value={balance} onChange={(e) => setBalance(e.target.value)} required />
          </label>
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreatePurchaseModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [supplierName, setSupplierName] = useState('')
  const [itemsCount, setItemsCount] = useState(24)
  const [totalAmount, setTotalAmount] = useState(38000)
  const [status, setStatus] = useState('Pending')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.purchases.create({
        supplier_name: supplierName,
        items_count: Number(itemsCount),
        total_amount: Number(totalAmount),
        status,
      })
      onSuccess()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <h2>New Purchase Order</h2>
            <p className="muted">Procure goods from verified vendors.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Supplier Name *
            <input placeholder="e.g. Global Tech Distributors" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required />
          </label>
          <div className="form-grid-2">
            <label>
              Items Count *
              <input type="number" min="1" value={itemsCount} onChange={(e) => setItemsCount(Number(e.target.value))} required />
            </label>
            <label>
              Total Cost (৳) *
              <input type="number" min="0" value={totalAmount} onChange={(e) => setTotalAmount(Number(e.target.value))} required />
            </label>
          </div>
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Pending</option>
              <option>Received</option>
              <option>Partially received</option>
            </select>
          </label>
          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function WorkspaceSwitcherModal({
  user,
  onClose,
  showToast,
}: {
  user: any
  onClose: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}) {
  const currentWorkspace = user.workspace || 'NS ERP / Aster Trading Ltd.'
  const workspaces = [
    {
      id: 'ws-1',
      name: 'Aster Trading Ltd.',
      tenantId: 'TENANT-001',
      location: 'Dhaka, Bangladesh',
      currency: 'BDT (৳)',
      isPrimary: true,
      active: true,
    },
    {
      id: 'ws-2',
      name: 'Aster Logistics Ltd.',
      tenantId: 'TENANT-002',
      location: 'Chittagong, Bangladesh',
      currency: 'BDT (৳)',
      isPrimary: false,
      active: false,
      requiresLicense: true,
    },
  ]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 480px)' }}>
        <div className="modal-heading">
          <div>
            <h2>Authorized Workspaces</h2>
            <p className="muted">Multi-tenant company context and active enterprise workspaces.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'grid', gap: 12, margin: '10px 0' }}>
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 10,
                border: ws.active ? '2px solid var(--app-primary, #6c63ff)' : '1px solid var(--app-border)',
                background: ws.active ? 'rgba(108, 99, 255, 0.05)' : 'var(--app-surface)',
                cursor: ws.requiresLicense ? 'not-allowed' : 'pointer',
              }}
              onClick={() => {
                if (ws.active) {
                  showToast(`Already active in ${ws.name}`)
                } else {
                  showToast('Access restricted: Additional tenant branch requires Enterprise Multi-Company license', 'error')
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    display: 'grid',
                    placeItems: 'center',
                    background: ws.active ? 'var(--app-primary, #6c63ff)' : '#e2e8f0',
                    color: ws.active ? '#ffffff' : '#64748b',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  <Building2 size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <b style={{ fontSize: 13 }}>{ws.name}</b>
                    {ws.isPrimary && (
                      <span className="badge badge-active" style={{ fontSize: 9, padding: '1px 6px' }}>
                        Primary HQ
                      </span>
                    )}
                  </div>
                  <small className="muted" style={{ fontSize: 10 }}>
                    {ws.tenantId} · {ws.location} · {ws.currency}
                  </small>
                </div>
              </div>

              <div>
                {ws.active ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#16a34a', fontSize: 11, fontWeight: 600 }}>
                    <Check size={14} /> Active
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--app-muted)' }}>
                    <Lock size={12} /> Restricted
                  </span>
                )}
              </div>
            </div>
          ))}

          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--app-bg)',
              border: '1px solid var(--app-border)',
              fontSize: 11,
              color: 'var(--app-muted)',
              lineHeight: 1.45,
            }}
          >
            <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: 5, color: '#6c63ff' }} />
            Tenant isolation active. Workspace switching preserves your authenticated role permissions (<b>{user.role}</b>) and strictly prevents cross-company data leakage.
          </div>
        </div>

        <div className="modal-actions">
          <button className="button primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function ProfileDetailsModal({ user, onClose }: { user: any; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <h2>User Profile</h2>
            <p className="muted">Your active account credentials and access permissions.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'grid', gap: 14, margin: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '2px solid #6c63ff' }} />
            ) : (
              <span className="avatar" style={{ width: 54, height: 54, fontSize: 18 }}>{user.initials || 'NS'}</span>
            )}
            <div>
              <b style={{ fontSize: 16 }}>{user.name}</b>
              <small className="muted" style={{ display: 'block' }}>{user.email}</small>
            </div>
          </div>

          <div className="profile-form" style={{ margin: '10px 0', gap: 10 }}>
            <div>
              <label>Role</label>
              <input value={user.role} readOnly style={{ background: 'var(--app-bg)' }} />
            </div>
            <div>
              <label>User ID</label>
              <input value={`#USR-${user.id || '101'}`} readOnly style={{ background: 'var(--app-bg)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600 }}>Workspace</label>
            <input value={user.workspace || 'NS ERP / Aster Trading Ltd.'} readOnly style={{ background: 'var(--app-bg)', width: '100%', marginTop: 6 }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600 }}>Status & Security</label>
            <p className="muted" style={{ margin: '4px 0', fontSize: 11 }}>
              Authenticated via Laravel Sanctum Token. Access level: <b>{user.role}</b>.
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="button primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function HelpDocumentationModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 540px)' }}>
        <div className="modal-heading">
          <div>
            <h2>NS ERP Help & Documentation</h2>
            <p className="muted">Quick user guide, shortcuts, and default credentials.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="help-modal-grid">
          <div className="help-card-item">
            <b>🔑 Default Login Accounts</b>
            <p>Admin: <code>shakib@nserp.com</code> / <code>password</code></p>
            <p>Executive: <code>alex@nserp.com</code> / <code>password</code></p>
          </div>

          <div className="help-card-item">
            <b>⌨️ Keyboard Shortcuts</b>
            <p><code>Ctrl + K</code> or <code>Cmd + K</code>: Instant Global Search across all records.</p>
          </div>

          <div className="help-card-item">
            <b>📊 Executive Chart Controls</b>
            <p>Switch between October 2026, Full Year 2026, or Last 6 Months. Click on the chart legend items (Revenue / Orders) to toggle visibility!</p>
          </div>

          <div className="help-card-item">
            <b>🚀 Architecture & Tech Stack</b>
            <p>Frontend: Next.js 16 + React 19 + Turbopack + Tailwind CSS</p>
            <p>Backend: Laravel 12 API + Sanctum Auth + SQLite Database</p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="button primary" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  )
}

/* ========================================================================= */
/* LOGIN SCREEN                                                              */
/* ========================================================================= */

function Login({ onLogin }: { onLogin: (u: any) => void }) {
  const [email, setEmail] = useState('shakib@nserp.com')
  const [password, setPassword] = useState('password')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState('Company Admin')

  const demoProfiles = [
    { role: 'Company Admin', email: 'shakib@nserp.com', label: '👑 Admin', color: '#665cf1' },
    { role: 'Manager', email: 'manager@nserp.com', label: '👔 Manager', color: '#2563eb' },
    { role: 'Accountant', email: 'accountant@nserp.com', label: '📊 Accountant', color: '#059669' },
    { role: 'Staff', email: 'staff@nserp.com', label: '🛠️ Staff', color: '#d97706' },
    { role: 'Employee', email: 'employee@nserp.com', label: '👤 Employee', color: '#64748b' },
  ]

  const handleSelectRole = (p: typeof demoProfiles[0]) => {
    setSelectedRole(p.role)
    setEmail(p.email)
    setPassword('password')
    setError('')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.auth.login({ email, password })
      if (res.token && res.user) {
        setStoredToken(res.token)
        onLogin(res.user)
        return
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      {/* Decorative ambient glowing orbs */}
      <div className="login-glow-orb-1" />
      <div className="login-glow-orb-2" />

      {/* Brand Header */}
      <div className="login-brand-header">
        <div className="login-brand-logo-wrap">
          <div className="login-brand-badge">NS</div>
          <span className="login-brand-title">NS ERP</span>
        </div>
        <p className="login-brand-subtitle">Next-Gen Enterprise Resource Planning Suite</p>
      </div>

      <div className="login-card">
        <div className="login-heading">
          <div className="login-status-pill">
            <span className="login-status-dot" />
            Enterprise Gateway · Online
          </div>
          <h1>Sign in to workspace</h1>
          <p>Enter your corporate credentials to access operations, inventory, and analytics.</p>
        </div>

        {error && (
          <div className="login-error-banner">
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} style={{ display: 'grid', gap: 14 }}>
          <div className="login-form-group">
            <label className="login-form-label">Corporate Email</label>
            <div className="login-input-wrapper">
              <Mail size={16} className="login-input-icon" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div className="login-form-group">
            <label className="login-form-label">Password</label>
            <div className="login-input-wrapper password-wrapper">
              <Lock size={16} className="login-input-icon" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                className="login-eye-toggle"
                onClick={() => setShowPass(!showPass)}
                title={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="login-options-row">
            <label className="check-label">
              <input type="checkbox" defaultChecked /> Remember workspace
            </label>
            <button type="button" className="login-forgot-link">Forgot password?</button>
          </div>

          <button className="login-submit-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                Authenticating...
              </>
            ) : (
              <>
                Sign in to ERP <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Role Profiles for Instant Testing */}
        <div className="login-roles-section">
          <div className="login-roles-header">
            <span className="login-roles-title">
              <Sparkles size={13} style={{ color: 'var(--app-primary)' }} />
              Quick Demo Access:
            </span>
            <span style={{ fontSize: 10, color: 'var(--app-muted)' }}>Auto-fills credentials</span>
          </div>
          <div className="login-roles-grid">
            {demoProfiles.map((p) => {
              const isSelected = selectedRole === p.role && email === p.email
              return (
                <button
                  key={p.role}
                  type="button"
                  className={`login-role-card ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectRole(p)}
                >
                  <span className="login-role-name">{p.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Security Tag */}
        <div className="login-security-tag">
          <ShieldCheck size={14} style={{ color: '#10b981' }} />
          <span>256-bit SSL Encrypted · Sanctum Token Guard</span>
        </div>
      </div>
    </main>
  )
}
