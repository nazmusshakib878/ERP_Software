<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\BankAccount;
use App\Models\Employee;
use App\Models\FinanceTransaction;
use App\Models\JournalEntry;
use App\Models\LeaveRequest;
use App\Models\Payroll;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase3ImplementationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_phase_3a_employee_attendance_lifecycle(): void
    {
        $employee = Employee::first();
        $this->assertNotNull($employee);

        // 1. Clock in
        $clockInRes = $this->postJson('/api/attendances/clock-in', [
            'employee_id' => $employee->id,
            'notes' => 'Morning check-in at HQ',
        ]);
        $clockInRes->assertStatus(201);
        $clockInRes->assertJsonFragment([
            'employee_id' => $employee->id,
        ]);

        // 2. Prevent duplicate clock-in for the same day
        $dupRes = $this->postJson('/api/attendances/clock-in', [
            'employee_id' => $employee->id,
        ]);
        $dupRes->assertStatus(422);

        // 3. Clock out
        $clockOutRes = $this->postJson('/api/attendances/clock-out', [
            'employee_id' => $employee->id,
        ]);
        $clockOutRes->assertStatus(200);
        $this->assertNotNull($clockOutRes->json('clock_out'));

        // 4. Attendance Summary
        $summaryRes = $this->getJson('/api/attendances/summary');
        $summaryRes->assertStatus(200);
        $summaryRes->assertJsonStructure([
            'date',
            'total_employees',
            'present',
            'late',
            'on_leave',
            'absent',
        ]);
        $this->assertGreaterThanOrEqual(1, $summaryRes->json('present') + $summaryRes->json('late'));
    }

    public function test_phase_3a_leave_application_and_approval(): void
    {
        $employee = Employee::first();
        $admin = User::where('role', 'Company Admin')->first();

        // 1. Submit Leave Application
        $leaveRes = $this->postJson('/api/leaves', [
            'employee_id' => $employee->id,
            'leave_type' => 'Casual Leave',
            'start_date' => now()->addDays(2)->toDateString(),
            'end_date' => now()->addDays(4)->toDateString(),
            'reason' => 'Family event in Sylhet',
        ]);
        $leaveRes->assertStatus(201);
        $leaveId = $leaveRes->json('id');
        $this->assertEquals('Pending', $leaveRes->json('status'));
        $this->assertEquals(3, $leaveRes->json('days_count'));

        // 2. Approve Leave Application
        $approveRes = $this->actingAs($admin)->putJson("/api/leaves/{$leaveId}/status", [
            'status' => 'Approved',
        ]);
        $approveRes->assertStatus(200);
        $this->assertEquals('Approved', $approveRes->json('status'));

        // Verify attendance marked as On Leave for those dates
        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', now()->addDays(2)->toDateString())
            ->first();
        $this->assertNotNull($attendance);
        $this->assertEquals('On Leave', $attendance->status);

        // 3. Leave Balances
        $balanceRes = $this->getJson("/api/leaves/balances/{$employee->id}");
        $balanceRes->assertStatus(200);
        $casual = collect($balanceRes->json('balances'))->firstWhere('type', 'Casual Leave');
        $this->assertNotNull($casual);
        $this->assertEquals(3, $casual['used']);
        $this->assertEquals(11, $casual['remaining']); // 14 - 3 = 11
    }

    public function test_phase_3b_payroll_generation_and_finance_integration(): void
    {
        $month = '2026-10';

        // 1. Generate Payroll for active employees
        $genRes = $this->postJson('/api/payrolls/generate', [
            'month' => $month,
        ]);
        $genRes->assertStatus(200);
        $this->assertGreaterThan(0, $genRes->json('count'));

        $payroll = Payroll::where('month', $month)->first();
        $this->assertNotNull($payroll);
        $this->assertEquals('Draft', $payroll->status);
        $this->assertGreaterThan(0, $payroll->net_salary);

        // 2. Mark Payroll as Paid and verify finance integration
        $account = BankAccount::create([
            'name' => 'Primary Test Account',
            'account_number' => 'TEST-001',
            'bank_name' => 'Test Bank',
            'type' => 'Bank',
            'balance' => 500000.00,
        ]);

        $initialBalance = $account->balance;
        $payRes = $this->putJson("/api/payrolls/{$payroll->id}/status", [
            'status' => 'Paid',
            'payment_method' => 'Bank Transfer',
            'account_id' => $account->id,
        ]);
        $payRes->assertStatus(200);
        $this->assertEquals('Paid', $payRes->json('status'));

        // Check account balance deducted
        $account->refresh();
        $payroll->refresh();
        $this->assertEquals($initialBalance - $payroll->net_salary, $account->balance);

        // Check Finance Transaction created
        $txn = FinanceTransaction::where('reference', $payroll->reference)->first();
        $this->assertNotNull($txn);
        $this->assertEquals('Expense', $txn->type);
        $this->assertEquals('Payroll', $txn->category);
        $this->assertEquals($payroll->net_salary, $txn->amount);

        // Check Double-Entry General Ledger created
        $journalEntries = JournalEntry::where('reference', $payroll->reference)->get();
        $this->assertCount(2, $journalEntries);
        $debit = $journalEntries->sum('debit');
        $credit = $journalEntries->sum('credit');
        $this->assertEquals($payroll->net_salary, $debit);
        $this->assertEquals($payroll->net_salary, $credit);

        // 3. Payslip Breakdown API
        $payslipRes = $this->getJson("/api/payrolls/{$payroll->id}/payslip");
        $payslipRes->assertStatus(200);
        $payslipRes->assertJsonStructure([
            'payroll',
            'company',
            'employee',
            'breakdown' => [
                'basic_salary',
                'allowances',
                'deductions',
                'net_salary',
                'status',
            ],
        ]);
    }

    public function test_phase_3c_employee_self_service_portal(): void
    {
        $employee = Employee::first();
        $user = User::factory()->create([
            'email' => $employee->email,
            'role' => 'Employee',
        ]);

        $res = $this->actingAs($user)->getJson('/api/self-service/portal');
        $res->assertStatus(200);
        $res->assertJsonStructure([
            'employee',
            'today_attendance',
            'monthly_attendance',
            'leave_balances',
            'recent_leaves',
            'recent_payrolls',
        ]);
        $this->assertEquals($employee->id, $res->json('employee.id'));
    }

    public function test_phase_3d_finance_and_accounting_workflows(): void
    {
        // 1. Bank Accounts
        $accRes = $this->getJson('/api/finance/accounts');
        $accRes->assertStatus(200);
        $this->assertNotEmpty($accRes->json());
        $accountId = $accRes->json('0.id');

        // 2. Post Expense Transaction
        $initialBalance = BankAccount::find($accountId)->balance;
        $txnRes = $this->postJson('/api/finance/transactions', [
            'account_id' => $accountId,
            'date' => now()->toDateString(),
            'type' => 'Expense',
            'category' => 'Utilities',
            'amount' => 15000.00,
            'payment_method' => 'Bank Transfer',
            'description' => 'Dhaka Electric Supply (DESCO) bill',
        ]);
        $txnRes->assertStatus(201);

        // Verify balance decreased
        $this->assertEquals($initialBalance - 15000.00, BankAccount::find($accountId)->balance);

        // 3. General Ledger Balance
        $glRes = $this->getJson('/api/finance/general-ledger');
        $glRes->assertStatus(200);
        $summary = $glRes->json('summary');
        $this->assertTrue($summary['is_balanced'], 'General Ledger must be balanced (debit equals credit)');

        // 4. Profit & Loss Statement
        $pnlRes = $this->getJson('/api/finance/reports/pnl');
        $pnlRes->assertStatus(200);
        $pnlRes->assertJsonStructure([
            'period',
            'currency',
            'revenue' => ['gross_sales', 'net_revenue'],
            'cogs' => ['total_cogs'],
            'gross_profit',
            'operating_expenses' => ['payroll_salaries', 'general_expenses', 'total_operating_expenses'],
            'net_profit',
        ]);

        // 5. Balance Sheet
        $bsRes = $this->getJson('/api/finance/reports/balance-sheet');
        $bsRes->assertStatus(200);
        $bsRes->assertJsonStructure([
            'as_of_date',
            'assets' => ['cash_and_bank', 'accounts_receivable', 'inventory_valuation', 'total_current_assets'],
            'liabilities' => ['accounts_payable', 'total_liabilities'],
            'equity' => ['retained_earnings', 'total_equity'],
        ]);
    }
}
