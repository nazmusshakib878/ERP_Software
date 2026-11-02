<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\BankAccount;
use App\Models\Employee;
use App\Models\FinanceTransaction;
use App\Models\JournalEntry;
use App\Models\Payroll;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $query = Payroll::with('employee');

        if ($request->filled('month')) {
            $query->where('month', $request->month);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $payrolls = $query->orderBy('month', 'desc')->orderBy('id', 'desc')->get();

        return response()->json($payrolls);
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|string', // e.g. '2026-10'
            'employee_id' => 'nullable|exists:employees,id',
        ]);

        $month = $validated['month'];

        $empQuery = Employee::where('status', 'Active');
        if (!empty($validated['employee_id'])) {
            $empQuery->where('id', $validated['employee_id']);
        }

        $employees = $empQuery->get();
        $generated = [];

        foreach ($employees as $employee) {
            $grossSalary = (float) $employee->salary;
            if ($grossSalary <= 0) {
                $grossSalary = 30000; // default minimum benchmark
            }

            // Standard Bangladesh Salary Structure:
            // Basic: 60% of Gross
            // Allowances (40%): House Rent 25%, Medical 10%, Conveyance 5%
            // Deductions: Provident Fund (5% of Basic) + Tax (if applicable)
            $basic = round($grossSalary * 0.60, 2);
            $allowances = round($grossSalary * 0.40, 2);
            $pfDeduction = round($basic * 0.05, 2);
            $taxDeduction = ($grossSalary > 40000) ? round(($grossSalary - 40000) * 0.05, 2) : 0;
            $totalDeductions = $pfDeduction + $taxDeduction;
            $netSalary = round($basic + $allowances - $totalDeductions, 2);

            $payroll = Payroll::updateOrCreate(
                [
                    'employee_id' => $employee->id,
                    'month' => $month,
                ],
                [
                    'basic_salary' => $basic,
                    'allowances' => $allowances,
                    'deductions' => $totalDeductions,
                    'net_salary' => $netSalary,
                    'status' => 'Draft',
                    'payment_method' => 'Bank Transfer',
                    'notes' => "Gross: ৳{$grossSalary} | Allowances: ৳{$allowances} | PF: ৳{$pfDeduction} | Tax: ৳{$taxDeduction}",
                ]
            );

            $generated[] = $payroll->load('employee');
        }

        Activity::create([
            'message' => 'Monthly payroll generated for ' . count($generated) . ' active employees for ' . $month,
            'actor' => $request->user()?->name ?? 'Admin',
            'type' => 'hr',
        ]);

        return response()->json([
            'message' => 'Payroll generated successfully',
            'month' => $month,
            'count' => count($generated),
            'payrolls' => $generated,
        ], 200);
    }

    public function updateStatus(Request $request, $id)
    {
        $payroll = Payroll::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:Draft,Approved,Paid',
            'payment_method' => 'nullable|string',
            'account_id' => 'nullable|exists:bank_accounts,id',
        ]);

        DB::transaction(function () use ($payroll, $validated, $request) {
            $newStatus = $validated['status'];
            $paidDate = ($newStatus === 'Paid') ? now()->toDateString() : $payroll->paid_date;
            $ref = $payroll->reference ?? ('PAY-' . str_pad($payroll->id, 5, '0', STR_PAD_LEFT));

            $payroll->update([
                'status' => $newStatus,
                'payment_method' => $validated['payment_method'] ?? $payroll->payment_method,
                'paid_date' => $paidDate,
                'reference' => $ref,
            ]);

            // When paid, integrate directly with Finance:
            if ($newStatus === 'Paid') {
                $account = null;
                if (!empty($validated['account_id'])) {
                    $account = BankAccount::find($validated['account_id']);
                } else {
                    $account = BankAccount::first();
                }

                if ($account) {
                    $account->decrement('balance', $payroll->net_salary);
                }

                // Record financial transaction
                FinanceTransaction::create([
                    'transaction_number' => 'TXN-' . strtoupper(uniqid()),
                    'account_id' => $account?->id,
                    'date' => now()->toDateString(),
                    'type' => 'Expense',
                    'category' => 'Payroll',
                    'amount' => $payroll->net_salary,
                    'payment_method' => $payroll->payment_method,
                    'reference' => $ref,
                    'description' => 'Salary payment for ' . $payroll->employee->name . ' (' . $payroll->month . ')',
                ]);

                // Double-Entry Journal Entry
                $entryNum = 'JE-' . date('Ymd') . '-' . rand(1000, 9999);
                JournalEntry::create([
                    'entry_number' => $entryNum,
                    'date' => now()->toDateString(),
                    'account_name' => 'Payroll Expense',
                    'debit' => $payroll->net_salary,
                    'credit' => 0,
                    'reference' => $ref,
                    'description' => 'Employee Salary: ' . $payroll->employee->name,
                ]);

                JournalEntry::create([
                    'entry_number' => $entryNum,
                    'date' => now()->toDateString(),
                    'account_name' => 'Cash & Bank',
                    'debit' => 0,
                    'credit' => $payroll->net_salary,
                    'reference' => $ref,
                    'description' => 'Bank disbursement: ' . $payroll->employee->name,
                ]);
            }
        });

        Activity::create([
            'message' => 'Payroll for ' . $payroll->employee->name . ' marked as ' . $validated['status'],
            'actor' => $request->user()?->name ?? 'Admin',
            'type' => 'hr',
        ]);

        return response()->json($payroll->fresh()->load('employee'));
    }

    public function payslip(Request $request, $id)
    {
        $payroll = Payroll::with('employee')->findOrFail($id);
        $emp = $payroll->employee;

        $gross = (float) $emp->salary;
        $basic = (float) $payroll->basic_salary;
        $allowances = (float) $payroll->allowances;
        $houseRent = round($gross * 0.25, 2);
        $medical = round($gross * 0.10, 2);
        $conveyance = round($gross * 0.05, 2);
        $pf = round($basic * 0.05, 2);
        $tax = max(0, round((float)$payroll->deductions - $pf, 2));

        return response()->json([
            'payroll' => $payroll,
            'company' => [
                'name' => 'NS ERP / Aster Trading Ltd.',
                'address' => 'Gulshan-2, Dhaka-1212, Bangladesh',
                'bin' => 'BIN-948201-BD',
                'tin' => 'TIN-4820-9182',
            ],
            'employee' => [
                'id' => $emp->id,
                'code' => $emp->code,
                'name' => $emp->name,
                'role' => $emp->role,
                'department' => $emp->department,
                'email' => $emp->email,
                'phone' => $emp->phone,
                'hire_date' => $emp->hire_date?->format('d M Y'),
            ],
            'breakdown' => [
                'month' => $payroll->month,
                'basic_salary' => $basic,
                'allowances' => [
                    'house_rent' => $houseRent,
                    'medical' => $medical,
                    'conveyance' => $conveyance,
                    'total' => $allowances,
                ],
                'deductions' => [
                    'provident_fund' => $pf,
                    'tax' => $tax,
                    'total' => (float) $payroll->deductions,
                ],
                'net_salary' => (float) $payroll->net_salary,
                'status' => $payroll->status,
                'payment_method' => $payroll->payment_method,
                'paid_date' => $payroll->paid_date?->format('d M Y'),
                'reference' => $payroll->reference,
            ],
        ]);
    }
}

