<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\PayrollController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\SelfServiceController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\TaxRateController;
use App\Http\Controllers\Api\WarehouseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Health Check & Monitoring
Route::get('/health', [HealthController::class, 'check']);

// Public Authentication (Rate limited: 10 attempts per minute to mitigate brute force)
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

// Authenticated Enterprise Routes
Route::middleware(['auth:sanctum', 'role'])->group(function () {
    // Session & User Info
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard & Executive Analytics
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Products & Inventory Management
    Route::apiResource('products', ProductController::class);
    Route::post('/inventory/transfer', [ProductController::class, 'transferStock']);
    Route::post('/inventory/adjust', [ProductController::class, 'adjustStock']);

    // Customers & CRM
    Route::apiResource('customers', CustomerController::class);

    // Sales, Orders & Returns
    Route::apiResource('sales', SaleController::class);
    Route::post('/sales/{id}/return', [SaleController::class, 'processReturn']);

    // Employees & Human Resources
    Route::apiResource('employees', EmployeeController::class);

    // Attendance & Leave Management
    Route::get('/attendances/summary', [AttendanceController::class, 'summary']);
    Route::get('/attendances', [AttendanceController::class, 'index']);
    Route::post('/attendances/clock-in', [AttendanceController::class, 'clockIn']);
    Route::post('/attendances/clock-out', [AttendanceController::class, 'clockOut']);
    Route::post('/attendances/record', [AttendanceController::class, 'record']);

    Route::get('/leaves', [LeaveController::class, 'index']);
    Route::post('/leaves', [LeaveController::class, 'store']);
    Route::put('/leaves/{id}/status', [LeaveController::class, 'updateStatus']);
    Route::get('/leaves/balances/{employeeId}', [LeaveController::class, 'balances']);

    // Payroll Management
    Route::get('/payrolls', [PayrollController::class, 'index']);
    Route::post('/payrolls/generate', [PayrollController::class, 'generate']);
    Route::put('/payrolls/{id}/status', [PayrollController::class, 'updateStatus']);
    Route::get('/payrolls/{id}/payslip', [PayrollController::class, 'payslip']);

    // Employee Self-Service (Accessible to all roles)
    Route::get('/self-service/portal', [SelfServiceController::class, 'portal']);

    // Finance & Double-Entry Accounting
    Route::get('/finance/accounts', [FinanceController::class, 'accounts']);
    Route::post('/finance/accounts', [FinanceController::class, 'storeAccount']);
    Route::get('/finance/transactions', [FinanceController::class, 'transactions']);
    Route::post('/finance/transactions', [FinanceController::class, 'storeTransaction']);
    Route::get('/finance/general-ledger', [FinanceController::class, 'generalLedger']);
    Route::get('/finance/reports/pnl', [FinanceController::class, 'profitAndLoss']);
    Route::get('/finance/reports/balance-sheet', [FinanceController::class, 'balanceSheet']);

    // Purchases & Supply Chain
    Route::apiResource('purchases', PurchaseController::class);
    Route::post('/purchases/{id}/receive', [PurchaseController::class, 'receiveGoods']);

    // Invoices & Billing
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
    Route::post('/invoices/{id}/pay', [InvoiceController::class, 'recordPayment']);

    // Audit Trail
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::post('/audit-logs', [AuditLogController::class, 'store']);

    // Warehouses & Multi-Location
    Route::get('/warehouses', [WarehouseController::class, 'index']);
    Route::post('/warehouses', [WarehouseController::class, 'store']);

    // Tax Rates
    Route::get('/tax-rates', [TaxRateController::class, 'index']);
    Route::post('/tax-rates', [TaxRateController::class, 'store']);

    // Workspace Settings (Viewing allowed to Manager/Accountant/Staff, modifications restricted to Admin)
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update'])->middleware('role:Company Admin');

    // Roles, Permissions & User Privileges (Restricted exclusively to Company Admin)
    Route::middleware('role:Company Admin')->group(function () {
        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::put('/users/{id}/permissions', [RoleController::class, 'updateUserPermissions']);
    });
});
