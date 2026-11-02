<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\BankAccount;
use App\Models\Customer;
use App\Models\FinanceTransaction;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $invoices = $query->orderBy('date', 'desc')->get();

        return response()->json($invoices);
    }

    public function show($id)
    {
        $invoice = Invoice::with('sale.items')->findOrFail($id);
        return response()->json($invoice);
    }

    public function recordPayment(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $invoice = Invoice::with('sale')->lockForUpdate()->findOrFail($id);

            $validated = $request->validate([
                'amount' => 'required|numeric|min:0.01',
                'payment_method' => 'nullable|string',
                'account_id' => 'nullable|exists:bank_accounts,id',
                'notes' => 'nullable|string',
            ]);

            $paymentAmount = round((float) $validated['amount'], 2);
            $remainingDue = round($invoice->total_amount - $invoice->paid_amount, 2);

            if ($paymentAmount > $remainingDue) {
                return response()->json([
                    'message' => "Payment amount (৳{$paymentAmount}) exceeds remaining balance (৳{$remainingDue}) for invoice {$invoice->invoice_number}.",
                ], 422);
            }

            $newPaid = round($invoice->paid_amount + $paymentAmount, 2);
            $status = ($newPaid >= $invoice->total_amount) ? 'Paid' : 'Partially paid';

            $invoice->update([
                'paid_amount' => $newPaid,
                'status' => $status,
            ]);

            if ($invoice->sale) {
                $invoice->sale->update([
                    'status' => $status === 'Paid' ? 'Paid' : 'Partial',
                ]);

                // Update customer total spent
                if ($invoice->sale->customer_id) {
                    $customer = Customer::find($invoice->sale->customer_id);
                    if ($customer) {
                        $customer->increment('spent', $paymentAmount);
                    }
                }
            }

            // Post to bank account and finance transaction
            $account = null;
            if (!empty($validated['account_id'])) {
                $account = BankAccount::lockForUpdate()->find($validated['account_id']);
            }
            if (!$account) {
                $account = BankAccount::lockForUpdate()->where('status', 'Active')->first();
            }

            if ($account) {
                $account->increment('balance', $paymentAmount);

                $txnNum = 'TXN-' . strtoupper(uniqid());
                FinanceTransaction::create([
                    'transaction_number' => $txnNum,
                    'account_id' => $account->id,
                    'date' => now()->toDateString(),
                    'type' => 'Income',
                    'category' => 'Sales Income',
                    'amount' => $paymentAmount,
                    'payment_method' => $validated['payment_method'] ?? 'Bank Transfer',
                    'reference' => $invoice->invoice_number,
                    'description' => "Invoice payment received for {$invoice->invoice_number} ({$invoice->customer_name})",
                ]);
            }

            AuditLog::create([
                'user_name' => $request->user()?->name ?? 'Accountant',
                'action' => 'Payment Recorded',
                'module' => 'Finance',
                'record_reference' => $invoice->invoice_number,
                'details' => "Recorded payment of ৳{$paymentAmount} for invoice {$invoice->invoice_number}. New status: {$status}.",
                'ip_address' => $request->ip(),
            ]);

            return response()->json($invoice);
        });
    }
}
