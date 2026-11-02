# NEXORA ERP - Backend (Laravel 12 API)

Enterprise Resource Planning RESTful API backend built with Laravel 12 and Laravel Sanctum authentication.

## Features
- **Authentication**: Token-based Sanctum authentication (`/api/login`, `/api/logout`, `/api/me`)
- **Dashboard**: Real-time aggregated stats, KPIs, and trajectory calculations (`/api/dashboard/stats`)
- **Products & Inventory**: Full CRUD, stock level tracking, warehouse allocations, reorder alerts (`/api/products`)
- **Sales & Orders**: Order processing with automatic stock deduction and invoice generation (`/api/sales`)
- **Customers & CRM**: Directory management, enterprise tiers, lifetime spending tracking (`/api/customers`)
- **Procurement & Purchases**: Purchase order management and vendor tracking (`/api/purchases`)
- **Human Resources**: Staff directory, roles, departments, payroll information (`/api/employees`)
- **Finance & Invoicing**: Invoices, receivable accounts, payment recordings (`/api/invoices`)
- **Workspace Settings**: Business parameters, timezones, and dark mode preferences (`/api/settings`)

## How to Run
```bash
# 1. Navigate to backend directory
cd backend

# 2. Start the Laravel development server
php artisan serve
```
The API server will run at `http://127.0.0.1:8000`.

## Default Credentials
- **Admin**: `arif@nexora.com` / `password`
- **Executive**: `alex@nexora.demo` / `password`
