// API client for NS ERP connecting to Laravel backend

function resolveApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!envUrl) {
    return 'http://127.0.0.1:8000/api';
  }
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export const API_BASE = resolveApiBase();

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('erp_token');
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('erp_token', token);
  } else {
    localStorage.removeItem('erp_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.message || (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : `API Error: ${res.statusText}`);
    throw new Error(message);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ message: string; token: string; user: any }>('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    logout: () =>
      request<{ message: string }>('/logout', { method: 'POST' }),
    me: () =>
      request<{ user: any }>('/me'),
  },

  dashboard: {
    stats: () => request<any>('/dashboard/stats'),
  },

  products: {
    list: (params?: { search?: string; category?: string; warehouse?: string; status?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<any[]>(`/products${q ? `?${q}` : ''}`);
    },
    create: (data: any) =>
      request<any>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number | string, data: any) =>
      request<any>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number | string) =>
      request<{ message: string }>(`/products/${id}`, {
        method: 'DELETE',
      }),
  },

  customers: {
    list: (params?: { search?: string; status?: string; tier?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<any[]>(`/customers${q ? `?${q}` : ''}`);
    },
    create: (data: any) =>
      request<any>('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number | string, data: any) =>
      request<any>(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number | string) =>
      request<{ message: string }>(`/customers/${id}`, {
        method: 'DELETE',
      }),
  },

  sales: {
    list: (params?: { search?: string; status?: string; payment_method?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<any[]>(`/sales${q ? `?${q}` : ''}`);
    },
    create: (data: any) =>
      request<any>('/sales', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number | string, data: any) =>
      request<any>(`/sales/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number | string) =>
      request<{ message: string }>(`/sales/${id}`, {
        method: 'DELETE',
      }),
    processReturn: (id: number | string, data: { reason: string; restock?: boolean; refund_amount?: number }) =>
      request<any>(`/sales/${id}/return`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  inventory: {
    transfer: (data: { product_id: number | string; from_warehouse: string; to_warehouse: string; quantity: number; notes?: string }) =>
      request<any>('/inventory/transfer', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    adjust: (data: { product_id: number | string; adjustment_type: string; quantity: number; reason: string; warehouse?: string }) =>
      request<any>('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  employees: {
    list: (params?: { search?: string; department?: string; status?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<any[]>(`/employees${q ? `?${q}` : ''}`);
    },
    create: (data: any) =>
      request<any>('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number | string, data: any) =>
      request<any>(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number | string) =>
      request<{ message: string }>(`/employees/${id}`, {
        method: 'DELETE',
      }),
  },

  purchases: {
    list: (params?: { search?: string; status?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<any[]>(`/purchases${q ? `?${q}` : ''}`);
    },
    create: (data: any) =>
      request<any>('/purchases', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number | string, data: any) =>
      request<any>(`/purchases/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number | string) =>
      request<{ message: string }>(`/purchases/${id}`, {
        method: 'DELETE',
      }),
    receiveGoods: (id: number | string, data: { quantity_received: number; warehouse?: string; product_id?: number | string }) =>
      request<any>(`/purchases/${id}/receive`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  invoices: {
    list: (params?: { search?: string; status?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<any[]>(`/invoices${q ? `?${q}` : ''}`);
    },
    recordPayment: (id: number | string, amount: number) =>
      request<any>(`/invoices/${id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),
  },

  settings: {
    get: () => request<Record<string, string>>('/settings'),
    update: (data: Record<string, any>) =>
      request<{ message: string; settings: Record<string, string> }>('/settings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  roles: {
    list: () => request<{ roles: any[]; permissions: any[]; users: any[] }>('/roles'),
    create: (data: any) =>
      request<any>('/roles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateUserPermissions: (id: number | string, data: { role?: string; allowed_modules?: string[]; permissions?: string[] }) =>
      request<any>(`/users/${id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  auditLogs: {
    list: (params?: { module?: string; search?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<any[]>(`/audit-logs${q ? `?${q}` : ''}`);
    },
    create: (data: any) =>
      request<any>('/audit-logs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  warehouses: {
    list: () => request<any[]>('/warehouses'),
    create: (data: any) =>
      request<any>('/warehouses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  taxRates: {
    list: () => request<any[]>('/tax-rates'),
    create: (data: any) =>
      request<any>('/tax-rates', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Phase 3A: Attendance & Leaves
  attendances: {
    list: (params?: { employee_id?: number; date?: string; month?: string; status?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<any[]>(`/attendances${q ? `?${q}` : ''}`);
    },
    summary: (date?: string) =>
      request<any>(`/attendances/summary${date ? `?date=${date}` : ''}`),
    clockIn: (data?: { employee_id?: number; notes?: string }) =>
      request<any>('/attendances/clock-in', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    clockOut: (data?: { employee_id?: number }) =>
      request<any>('/attendances/clock-out', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    record: (data: any) =>
      request<any>('/attendances/record', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  leaves: {
    list: (params?: { employee_id?: number; status?: string; leave_type?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<any[]>(`/leaves${q ? `?${q}` : ''}`);
    },
    apply: (data: { employee_id: number; leave_type: string; start_date: string; end_date: string; reason: string }) =>
      request<any>('/leaves', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: number | string, data: { status: 'Approved' | 'Rejected'; rejection_reason?: string }) =>
      request<any>(`/leaves/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    balances: (employeeId: number | string) =>
      request<any>(`/leaves/balances/${employeeId}`),
  },

  // Phase 3B: Payroll & Payslips
  payrolls: {
    list: (params?: { month?: string; status?: string; employee_id?: number }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<any[]>(`/payrolls${q ? `?${q}` : ''}`);
    },
    generate: (data: { month: string; employee_id?: number }) =>
      request<any>('/payrolls/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: number | string, data: { status: string; payment_method?: string; account_id?: number }) =>
      request<any>(`/payrolls/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    payslip: (id: number | string) =>
      request<any>(`/payrolls/${id}/payslip`),
  },

  // Phase 3C: Employee Self-Service
  selfService: {
    portal: () => request<any>('/self-service/portal'),
  },

  // Phase 3D: Finance & Accounting
  finance: {
    accounts: () => request<any[]>('/finance/accounts'),
    createAccount: (data: any) =>
      request<any>('/finance/accounts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    transactions: (params?: { type?: string; category?: string; account_id?: number }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<any[]>(`/finance/transactions${q ? `?${q}` : ''}`);
    },
    createTransaction: (data: any) =>
      request<any>('/finance/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    generalLedger: () => request<any>('/finance/general-ledger'),
    pnl: () => request<any>('/finance/reports/pnl'),
    balanceSheet: () => request<any>('/finance/reports/balance-sheet'),
  },
};

