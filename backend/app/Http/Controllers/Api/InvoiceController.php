<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;

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
        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $newPaid = $invoice->paid_amount + $validated['amount'];
        $status = $newPaid >= $invoice->total_amount ? 'Paid' : 'Partially paid';

        $invoice->update([
            'paid_amount' => min($invoice->total_amount, $newPaid),
            'status' => $status,
        ]);

        if ($invoice->sale) {
            $invoice->sale->update([
                'status' => $status === 'Paid' ? 'Paid' : 'Partial',
            ]);
        }

        return response()->json($invoice);
    }
}

