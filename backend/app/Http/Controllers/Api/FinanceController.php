<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\BankAccount;
use App\Models\FinanceTransaction;
use App\Models\Invoice;
use App\Models\JournalEntry;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    public function accounts(Request $request)
    {
        $accounts = BankAccount::withCount('transactions')->get();

        // Seed default accounts if empty
        if ($accounts->isEmpty()) {
            BankAccount::create([
                'name' => 'Dutch-Bangla Bank Ltd (Corporate)',
                'account_number' => 'DBBL-0192-88219-01',
                'bank_name' => 'Dutch-Bangla Bank',
                'branch' => 'Gulshan Branch',
                'type' => 'Bank',
                'balance' => 4500000.00,
                'currency' => 'BDT',
                'status' => 'Active',
            ]);

            BankAccount::create([
                'name' => 'City Bank Ltd (Current A/C)',
                'account_number' => 'CBL-3310-92817-02',
                'bank_name' => 'The City Bank',
                'branch' => 'Banani Branch',
                'type' => 'Bank',
                'balance' => 2850000.00,
                'currency' => 'BDT',
                'status' => 'Active',
            ]);

            BankAccount::create([
                'name' => 'bKash Merchant Account',
                'account_number' => '01711-998822',
                'bank_name' => 'bKash Limited',
                'branch' => 'Head Office',
                'type' => 'Mobile Banking',
                'balance' => 420000.00,
                'currency' => 'BDT',
                'status' => 'Active',
            ]);

            BankAccount::create([
                'name' => 'Petty Cash Fund',
                'account_number' => 'CASH-VAULT-01',
                'bank_name' => 'Cash on Hand',
                'branch' => 'Dhaka HQ',
                'type' => 'Cash',
                'balance' => 150000.00,
                'currency' => 'BDT',
                'status' => 'Active',
            ]);

            $accounts = BankAccount::withCount('transactions')->get();
        }

        return response()->json($accounts);
    }

    public function storeAccount(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'bank_name' => 'required|string|max:255',
            'branch' => 'nullable|string|max:255',
            'type' => 'required|string|in:Bank,Mobile Banking,Cash',
            'balance' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:10',
        ]);

        $account = BankAccount::create($validated);

        return response()->json($account, 201);
    }

    public function transactions(Request $request)
    {
        $query = FinanceTransaction::with('account');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('account_id')) {
            $query->where('account_id', $request->account_id);
        }

        $txns = $query->orderBy('date', 'desc')->orderBy('id', 'desc')->get();

        return response()->json($txns);
    }

    public function storeTransaction(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:bank_accounts,id',
            'date' => 'required|date',
            'type' => 'required|string|in:Income,Expense,Transfer',
            'category' => 'required|string',
            'amount' => 'required|numeric|gt:0',
            'payment_method' => 'nullable|string',
            'reference' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $txn = DB::transaction(function () use ($validated, $request) {
            $account = BankAccount::findOrFail($validated['account_id']);
            $amount = (float) $validated['amount'];

            if ($validated['type'] === 'Income') {
                $account->increment('balance', $amount);
            } elseif ($validated['type'] === 'Expense') {
                if ($account->balance < $amount) {
                    abort(422, 'Insufficient balance in ' . $account->name);
                }
                $account->decrement('balance', $amount);
            }

            $txnNum = 'TXN-' . strtoupper(uniqid());
            $transaction = FinanceTransaction::create([
                'transaction_number' => $txnNum,
                'account_id' => $account->id,
                'date' => $validated['date'],
                'type' => $validated['type'],
                'category' => $validated['category'],
                'amount' => $amount,
                'payment_method' => $validated['payment_method'] ?? 'Bank Transfer',
                'reference' => $validated['reference'] ?? $txnNum,
                'description' => $validated['description'] ?? null,
            ]);

            // Double Entry Journal Entry
            $jeNum = 'JE-' . date('Ymd') . '-' . rand(1000, 9999);
            if ($validated['type'] === 'Income') {
                JournalEntry::create([
                    'entry_number' => $jeNum,
                    'date' => $validated['date'],
                    'account_name' => 'Cash & Bank',
                    'debit' => $amount,
                    'credit' => 0,
                    'reference' => $transaction->transaction_number,
                    'description' => $transaction->description ?? ('Income: ' . $transaction->category),
                ]);
                JournalEntry::create([
                    'entry_number' => $jeNum,
                    'date' => $validated['date'],
                    'account_name' => 'Sales Revenue',
                    'debit' => 0,
                    'credit' => $amount,
                    'reference' => $transaction->transaction_number,
                    'description' => $transaction->description ?? ('Income: ' . $transaction->category),
                ]);
            } else {
                JournalEntry::create([
                    'entry_number' => $jeNum,
                    'date' => $validated['date'],
                    'account_name' => 'General Expense',
                    'debit' => $amount,
                    'credit' => 0,
                    'reference' => $transaction->transaction_number,
                    'description' => $transaction->description ?? ('Expense: ' . $transaction->category),
                ]);
                JournalEntry::create([
                    'entry_number' => $jeNum,
                    'date' => $validated['date'],
                    'account_name' => 'Cash & Bank',
                    'debit' => 0,
                    'credit' => $amount,
                    'reference' => $transaction->transaction_number,
                    'description' => $transaction->description ?? ('Expense: ' . $transaction->category),
                ]);
            }

            return $transaction;
        });

        return response()->json($txn->load('account'), 201);
    }

    public function generalLedger(Request $request)
    {
        $entries = JournalEntry::orderBy('date', 'desc')->orderBy('id', 'desc')->get();

        $totalDebit = (float) $entries->sum('debit');
        $totalCredit = (float) $entries->sum('credit');

        return response()->json([
            'entries' => $entries,
            'summary' => [
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'is_balanced' => abs($totalDebit - $totalCredit) < 0.01,
            ],
        ]);
    }

    public function profitAndLoss(Request $request)
    {
        // 1. Revenue
        $totalRevenue = (float) Sale::where('status', '!=', 'Returned')->sum('total');

        // 2. Cost of Goods Sold (COGS)
        $cogs = (float) DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->where('sales.status', '!=', 'Returned')
            ->sum(DB::raw('sale_items.quantity * products.cost'));

        $grossProfit = max(0, $totalRevenue - $cogs);
        $grossMargin = $totalRevenue > 0 ? round(($grossProfit / $totalRevenue) * 100, 2) : 0;

        // 3. Operating Expenses
        // Paid Payrolls + General Expense Transactions
        $payrollExpenses = (float) DB::table('payrolls')->where('status', 'Paid')->sum('net_salary');
        if ($payrollExpenses == 0) {
            // Fallback to active employee salaries if payroll has not been disbursed yet
            $payrollExpenses = (float) DB::table('employees')->where('status', 'Active')->sum('salary');
        }

        $generalExpenses = (float) FinanceTransaction::where('type', 'Expense')->sum('amount');
        $totalExpenses = $payrollExpenses + $generalExpenses;

        // 4. Net Profit
        $netProfit = $grossProfit - $totalExpenses;
        $netMargin = $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100, 2) : 0;

        return response()->json([
            'period' => 'Fiscal Year 2026',
            'currency' => 'BDT',
            'revenue' => [
                'gross_sales' => $totalRevenue,
                'returns_allowances' => (float) Sale::where('status', 'Returned')->sum('total'),
                'net_revenue' => $totalRevenue,
            ],
            'cogs' => [
                'direct_product_cost' => $cogs,
                'total_cogs' => $cogs,
            ],
            'gross_profit' => $grossProfit,
            'gross_margin_percent' => $grossMargin,
            'operating_expenses' => [
                'payroll_salaries' => $payrollExpenses,
                'general_expenses' => $generalExpenses,
                'total_operating_expenses' => $totalExpenses,
            ],
            'net_profit' => $netProfit,
            'net_margin_percent' => $netMargin,
        ]);
    }

    public function balanceSheet(Request $request)
    {
        // 1. Assets
        $cashAndBank = (float) BankAccount::sum('balance');
        $accountsReceivable = (float) Invoice::where('status', '!=', 'Paid')
            ->selectRaw('SUM(total_amount - paid_amount) as outstanding')
            ->value('outstanding') ?? 0;

        $inventoryAsset = (float) Product::selectRaw('SUM(stock * cost) as val')->value('val') ?? 0;
        $totalCurrentAssets = $cashAndBank + $accountsReceivable + $inventoryAsset;

        // 2. Liabilities
        $accountsPayable = (float) Purchase::whereIn('status', ['Pending', 'Ordered'])
            ->sum('total_amount');
        $totalLiabilities = $accountsPayable;

        // 3. Equity
        $equity = max(0, $totalCurrentAssets - $totalLiabilities);

        return response()->json([
            'as_of_date' => now()->toDateString(),
            'currency' => 'BDT',
            'assets' => [
                'cash_and_bank' => $cashAndBank,
                'accounts_receivable' => $accountsReceivable,
                'inventory_valuation' => $inventoryAsset,
                'total_current_assets' => $totalCurrentAssets,
            ],
            'liabilities' => [
                'accounts_payable' => $accountsPayable,
                'total_liabilities' => $totalLiabilities,
            ],
            'equity' => [
                'retained_earnings' => $equity,
                'total_equity' => $equity,
            ],
            'total_liabilities_and_equity' => $totalLiabilities + $equity,
        ]);
    }
}

