# NS ERP — Enterprise Resource Planning System

A production-ready Enterprise Resource Planning (ERP) platform built with **Next.js 16 (React 19)** on the frontend and **Laravel 12 REST API** on the backend.

---

## 🌟 Architecture Overview

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Backend:** Laravel 12 REST API, Laravel Sanctum Token Authentication, SQLite / MySQL, Eloquent ORM.
- **Role-Based Access Control (RBAC):** 5 Primary Company Roles
  1. `Company Admin` (Full administrative privileges)
  2. `Manager` (Operations, inventory management, purchase/sales approvals)
  3. `Accountant` (Financial statements, chart of accounts, bank reconciliations)
  4. `Staff` (Configurable granular module access: View, Create, Edit, Delete, Approve, Export)
  5. `Employee` (Self-service portal: attendance, leave requests, payslips)

---

## 🚀 Live Deployment Guide

### Option A: Recommended Architecture (Best for Portfolio & 100% Free)

- **Frontend:** [Vercel](https://vercel.com) (Global Edge CDN, instantaneous SSR & SSG)
- **Backend:** [Render](https://render.com) (Free Docker/Web service container)
- **Keep-Alive (Optional):** [UptimeRobot](https://uptimerobot.com) or [cron-job.org](https://cron-job.org) (Ping every 10 mins to eliminate free-tier cold starts)

---

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "feat: complete NS ERP deployment-ready codebase"
git branch -M main
git remote add origin https://github.com/<your-username>/ns-erp.git
git push -u origin main
```

*(Note: `.gitignore` is already pre-configured to exclude `node_modules`, `vendor`, `.env`, and local SQLite database).*

---

### Step 2: Deploy Backend to Render

1. Log in to [Render.com](https://render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name:** `nserp-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker` (Render automatically detects `backend/Dockerfile`)
   - **Instance Type:** `Free`
4. In the **Environment Variables** tab, add:
   - `APP_NAME` = `NS ERP`
   - `APP_ENV` = `production`
   - `APP_DEBUG` = `false`
   - `APP_KEY` = `base64:MFx0vucEBKbZhfyOi3CiG4IEq2m3epe2dgplC3MSfD8=` *(or generate a new one via `php artisan key:generate --show`)*
   - `DB_CONNECTION` = `sqlite`
   - `DB_DATABASE` = `/var/www/database/database.sqlite`
5. Click **Create Web Service**.
   - The container builds in ~2 minutes.
   - Migrations and default seeders run automatically on startup via `entrypoint.sh`.
   - Your backend URL will be: `https://nserp-api.onrender.com` (or similar).

---

### Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. In the project setup screen:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click Edit and select `frontend`
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_API_URL` = `https://nserp-api.onrender.com/api` *(replace with your Render backend URL)*
5. Click **Deploy**.
   - Vercel builds the Next.js app in ~1 minute.
   - Your frontend URL will be: `https://ns-erp.vercel.app`.

---

## 🔐 Default Demo Accounts (Pre-Seeded)

All demo accounts share the password: `password123`

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **Company Admin** | `shakib@nserp.com` | Full enterprise control, RBAC manager, company settings |
| **Manager** | `manager@nserp.com` | Operations, purchases, sales approvals, warehouses |
| **Accountant** | `accountant@nserp.com` | General ledger, chart of accounts, payments, payroll |
| **Staff** | `staff@nserp.com` | Configurable granular permissions assigned by Admin |
| **Employee** | `employee@nserp.com` | Employee Self-Service: attendance, leaves, payslips |

---

## 🛠 Local Development

### Backend (Laravel 12):
```bash
cd backend
composer install
php artisan migrate --seed
php artisan serve --port=8000
```

### Frontend (Next.js 16):
```bash
cd frontend
npm install
npm run dev
```
Visit: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing

Run backend feature and unit test suites:
```bash
cd backend
php artisan test
# 23 test suites passed (219 assertions)
```

Run frontend production build & TypeScript validation:
```bash
cd frontend
npm run build
# Compiled successfully in Turbopack, 0 errors
```

