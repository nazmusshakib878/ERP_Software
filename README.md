# NS ERP — Enterprise Resource Planning System (Production Grade)

NS ERP is a production-hardened Enterprise Resource Planning platform engineered for real Small and Medium Businesses (SMBs). Built on a decoupled enterprise architecture featuring **Next.js 16 (React 19)** on the frontend and **Laravel 12 REST API** with **Laravel Sanctum** token-based authentication and pessimistic concurrency control.

---

## 🏛️ System Architecture

- **Frontend:** Next.js 16 (App Router with Turbopack), React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Backend:** Laravel 12 REST API, Laravel Sanctum, Double-Entry General Ledger, Concurrency Row-Level Locking (`lockForUpdate()`), Database Transactions (`DB::transaction()`).
- **Production Databases Supported:** PostgreSQL (14+), MySQL (8.0+), or SQLite (local development only).
- **Deployment Topology:** Frontend on **Vercel** (Global Edge CDN), Backend on **Render** (Containerized Docker Web Service), Database on **Render Managed PostgreSQL** or external DB.

---

## 🛡️ Enterprise Security & RBAC Enforcement

The platform enforces strict Role-Based Access Control on the **Laravel API layer**, preventing privilege escalation even if the client UI is inspected:

| Role | Operational Scope & Permissions | Restricted Modules / Actions |
| :--- | :--- | :--- |
| **Company Admin** | Full root administrative authority. Can manage company settings, RBAC role definitions, and staff module permissions. | None (Unrestricted). |
| **Manager** | Operational leadership. Full control over Products, Inventory, Stock Adjustments, Purchases, Goods Receiving, Sales, and Leave/Payroll approvals. | Cannot modify workspace settings, tax rates, or alter admin permissions. |
| **Accountant** | Financial controller. Chart of accounts, journal entries, payments recording, financial P&L, balance sheets, invoice reconciliations, and payroll processing. | Cannot access raw system logs or modify staff module assignments. |
| **Staff** | Granular module access. Company Admin dynamically grants access to specific modules (Sales, Inventory, Purchases, Customers, etc.) and actions (View, Create, Edit, Delete, Approve, Stock Adjustment). | Automatically blocked from any unassigned module with HTTP 403 Forbidden. |
| **Employee** | Self-Service Portal only. Can clock in/out, view own attendance summary, apply for leaves, and inspect/download personal payslips. | Strictly blocked from all corporate sales, products, purchases, general ledger, and company records (HTTP 403 Forbidden). |

---

## 🚀 Production Deployment Guide

### A. Backend Deployment — Render (Docker Web Service)

1. Log in to [Render.com](https://render.com) and create a **New Managed PostgreSQL Database**:
   - **Name:** `nserp-postgres`
   - **Database:** `nserp_db`
   - **User:** `nserp_user`
   - Copy the **Internal Database URL** and credentials.
2. In Render, click **New +** -> **Web Service** and connect your GitHub repository (`ERP_Software`).
3. Set the following service configurations:
   - **Name:** `nserp-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker` (Render automatically uses `backend/Dockerfile`)
   - **Instance Type:** `Free` or `Starter`
4. Add the following **Environment Variables**:
   ```ini
   APP_NAME="NS ERP"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://nserp-api.onrender.com
   APP_KEY=base64:BYg4SMkKTM986r/Su3gWVqLo8IMpBux0hq+evwBVers=
   FRONTEND_URL=https://ns-erp.vercel.app
   ALLOWED_ORIGINS=https://ns-erp.vercel.app

   # Database Configuration (PostgreSQL)
   DB_CONNECTION=pgsql
   DB_HOST=<your-postgres-hostname.render.com>
   DB_PORT=5432
   DB_DATABASE=nserp_db
   DB_USERNAME=nserp_user
   DB_PASSWORD=<your-secure-postgres-password>
   DB_SSLMODE=prefer

   # Demo Seeding Flag (Leave false for fresh production data)
   SEED_DEMO_DATA=false
   ```
5. Click **Create Web Service**.
   - The container builds with PHP 8.2, `pdo_pgsql`, `bcmath`, and `opcache`.
   - `entrypoint.sh` executes `php artisan migrate --force` automatically.
   - Demo seeders are safely skipped unless `SEED_DEMO_DATA=true` is set.
   - Health check probe is available at `GET /api/health`.

---

### B. Frontend Deployment — Vercel

1. Log in to [Vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Select your repository and configure:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `frontend`
3. Add the environment variable:
   ```ini
   NEXT_PUBLIC_API_URL=https://nserp-api.onrender.com/api
   ```
4. Click **Deploy**. Vercel compiles the production build using Next.js Turbopack with 0 TypeScript errors.

---

## 🩺 Production Health & Monitoring

NS ERP provides an unauthenticated, zero-credential health check endpoint:

```http
GET /api/health
```

**Healthy Response (HTTP 200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-11-02T17:30:16+00:00",
  "app": {
    "name": "NS ERP",
    "env": "production"
  },
  "services": {
    "database": "connected",
    "database_driver": "pgsql",
    "storage": "writable",
    "cache": "operational"
  },
  "version": "1.0.0"
}
```

*Note: The health check verifies database PDO connectivity, filesystem storage permissions, and cache operational integrity without exposing database passwords, hostnames, or internal stack traces.*

---

## 💾 Database Backup & Disaster Recovery

### 1. Automated / Manual PostgreSQL Backup:
```bash
# Export full encrypted database dump
PGPASSWORD="your_password" pg_dump -h <host> -U nserp_user -d nserp_db -F c -b -v -f nserp_backup_$(date +%Y%m%d_%H%M%S).dump

# Plain SQL backup
PGPASSWORD="your_password" pg_dump -h <host> -U nserp_user -d nserp_db > nserp_backup_$(date +%Y%m%d).sql
```

### 2. Database Restoration:
```bash
# Restore from custom-format dump
PGPASSWORD="your_password" pg_restore -h <host> -U nserp_user -d nserp_db -v -c nserp_backup_20261102.dump

# Restore from plain SQL
PGPASSWORD="your_password" psql -h <host> -U nserp_user -d nserp_db -f nserp_backup_20261102.sql
```

---

## 🔐 Demo Accounts (For Staging / Testing)

To enable demo accounts on a staging server, set `SEED_DEMO_DATA=true`. All accounts use password: `password`

| Role | Email | Scope |
| :--- | :--- | :--- |
| **Company Admin** | `shakib@nserp.com` | Root enterprise operations, RBAC manager, company settings |
| **Manager** | `manager@nserp.com` | Inventory, supply chain, purchasing, approvals, warehouses |
| **Accountant** | `accountant@nserp.com` | General ledger, chart of accounts, payments, payroll |
| **Staff** | `staff@nserp.com` | Granular permissions assigned dynamically by Admin |
| **Employee** | `employee@nserp.com` | Self-Service Portal (Attendance, Leaves, Payslips) |

---

## 🧪 Automated Testing & Verification

### Run Laravel Backend Test Suite:
```bash
cd backend
php artisan test
# Result: 29 passed (249 assertions)
```

Verified test coverage includes:
- Production Health Check endpoint (`/api/health`)
- Unauthenticated access prevention (HTTP 401)
- Employee role isolation & forbidden endpoints (HTTP 403)
- Granular staff module permissions (HTTP 403)
- Concurrency-safe overselling prevention (`lockForUpdate()`)
- Partial and full goods receiving with duplicate delivery blocking
- Order deletion stock restoration & customer balance reconciliation
- Invoice payment recording with double-entry finance transaction posting
- Rapid submission duplicate order idempotency guard

### Run Frontend Production Build & TypeScript Check:
```bash
cd frontend
npm run build
# Result: Next.js 16 Turbopack compiled successfully, 0 TypeScript errors
```
