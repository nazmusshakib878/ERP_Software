<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Attendance Table
        if (!Schema::hasTable('attendances')) {
            Schema::create('attendances', function (Blueprint $table) {
                $table->id();
                $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
                $table->date('date');
                $table->string('clock_in')->nullable();
                $table->string('clock_out')->nullable();
                $table->string('status')->default('Present'); // Present, Late, Absent, Half Day, On Leave
                $table->decimal('work_hours', 5, 2)->default(0);
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->unique(['employee_id', 'date']);
            });
        }

        // 2. Leave Requests Table
        if (!Schema::hasTable('leave_requests')) {
            Schema::create('leave_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
                $table->string('leave_type'); // Casual Leave, Sick Leave, Annual Leave
                $table->date('start_date');
                $table->date('end_date');
                $table->integer('days_count')->default(1);
                $table->text('reason');
                $table->string('status')->default('Pending'); // Pending, Approved, Rejected
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->text('rejection_reason')->nullable();
                $table->timestamps();
            });
        }

        // 3. Payrolls Table
        if (!Schema::hasTable('payrolls')) {
            Schema::create('payrolls', function (Blueprint $table) {
                $table->id();
                $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
                $table->string('month'); // e.g. 2026-10
                $table->decimal('basic_salary', 12, 2)->default(0);
                $table->decimal('allowances', 12, 2)->default(0);
                $table->decimal('deductions', 12, 2)->default(0);
                $table->decimal('net_salary', 12, 2)->default(0);
                $table->string('status')->default('Draft'); // Draft, Approved, Paid
                $table->string('payment_method')->default('Bank Transfer');
                $table->date('paid_date')->nullable();
                $table->string('reference')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->unique(['employee_id', 'month']);
            });
        }

        // 4. Bank Accounts Table
        if (!Schema::hasTable('bank_accounts')) {
            Schema::create('bank_accounts', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('account_number');
                $table->string('bank_name');
                $table->string('branch')->nullable();
                $table->string('type')->default('Bank'); // Bank, Mobile Banking, Cash
                $table->decimal('balance', 14, 2)->default(0);
                $table->string('currency')->default('BDT');
                $table->string('status')->default('Active');
                $table->timestamps();
            });
        }

        // 5. Finance Transactions Table
        if (!Schema::hasTable('finance_transactions')) {
            Schema::create('finance_transactions', function (Blueprint $table) {
                $table->id();
                $table->string('transaction_number')->unique();
                $table->foreignId('account_id')->nullable()->constrained('bank_accounts')->nullOnDelete();
                $table->date('date');
                $table->string('type'); // Income, Expense, Transfer
                $table->string('category'); // Sales Income, Payroll, Rent, Utilities, etc.
                $table->decimal('amount', 14, 2)->default(0);
                $table->string('payment_method')->default('Bank Transfer');
                $table->string('reference')->nullable();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // 6. Journal Entries Table (Double-Entry General Ledger)
        if (!Schema::hasTable('journal_entries')) {
            Schema::create('journal_entries', function (Blueprint $table) {
                $table->id();
                $table->string('entry_number');
                $table->date('date');
                $table->string('account_name'); // Cash & Bank, Accounts Receivable, Inventory Asset, etc.
                $table->decimal('debit', 14, 2)->default(0);
                $table->decimal('credit', 14, 2)->default(0);
                $table->string('reference')->nullable();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
        Schema::dropIfExists('finance_transactions');
        Schema::dropIfExists('bank_accounts');
        Schema::dropIfExists('payrolls');
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('attendances');
    }
};

