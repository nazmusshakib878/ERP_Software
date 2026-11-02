<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with('items');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('rep_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $sales = $query->orderBy('date', 'desc')->orderBy('id', 'desc')->get();

        return response()->json($sales);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string',
            'customer_email' => 'nullable|email',
            'customer_id' => 'nullable|exists:customers,id',
            'payment_method' => 'required|string',
            'status' => 'required|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.product_name' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $year = date('Y');
            $nextOrderNum = 'SAL-' . $year . '-' . (1048 + Sale::count() + 1);

            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $subtotal += ($item['price'] * $item['quantity']);
            }
            $tax = round($subtotal * 0.15, 2); // 15% VAT standard
            $total = $subtotal + $tax;

            $sale = Sale::create([
                'order_number' => $nextOrderNum,
                'customer_id' => $validated['customer_id'] ?? null,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'] ?? null,
                'rep_name' => $request->user()?->name ?? 'Admin',
                'rep_avatar' => 'admin',
                'date' => now()->toDateString(),
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => 0,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'] ?? null,
                    'product_name' => $item['product_name'],
                    'sku' => $item['sku'] ?? 'NXR-' . rand(1000, 9999),
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['price'] * $item['quantity'],
                ]);

                // Reduce inventory stock with concurrency-safe locking and overselling prevention
                if (!empty($item['product_id'])) {
                    $prod = Product::lockForUpdate()->find($item['product_id']);
                    if ($prod) {
                        if ($prod->stock < $item['quantity']) {
                            abort(422, "Insufficient stock for '{$prod->name}'. Available: {$prod->stock}, Requested: {$item['quantity']}.");
                        }
                        $newStock = $prod->stock - $item['quantity'];
                        $status = $newStock <= 0 ? 'out_of_stock' : ($newStock <= $prod->threshold ? 'low_stock' : 'in_stock');
                        $prod->update([
                            'stock' => $newStock,
                            'status' => $status,
                        ]);
                    }
                }
            }

            // Distinguish paid vs unpaid receivables accurately
            $paidAmount = 0;
            if ($sale->status === 'Paid') {
                $paidAmount = $total;
            } elseif ($sale->status === 'Partial' || $sale->status === 'Partially paid') {
                $paidAmount = min($total, max(0, (float)($request->paid_amount ?? ($total * 0.5))));
            }

            // Update customer total spent (only actual paid revenue)
            if ($sale->customer_id && $paidAmount > 0) {
                $customer = Customer::find($sale->customer_id);
                if ($customer) {
                    $customer->increment('spent', $paidAmount);
                }
            }

            // Create corresponding Invoice (Unpaid amounts appear in Accounts Receivable)
            $invoiceStatus = ($paidAmount >= $total) ? 'Paid' : ($paidAmount > 0 ? 'Partially paid' : 'Unpaid');
            Invoice::create([
                'invoice_number' => 'INV-' . date('Y') . '-' . (1048 + Invoice::count() + 1),
                'sale_id' => $sale->id,
                'customer_name' => $sale->customer_name,
                'date' => now()->toDateString(),
                'due_date' => now()->addDays(30)->toDateString(),
                'total_amount' => $total,
                'paid_amount' => $paidAmount,
                'status' => $invoiceStatus,
            ]);

            Activity::create([
                'message' => ($request->user()?->name ?? 'Admin') . " created sale {$sale->order_number} for {$sale->customer_name}",
                'actor' => $request->user()?->name ?? 'Admin',
                'type' => 'sale',
            ]);

            return response()->json($sale->load('items'), 201);
        });
    }

    public function show($id)
    {
        $sale = Sale::with('items')->findOrFail($id);
        return response()->json($sale);
    }

    public function update(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|required|string|in:Paid,Unpaid,Partial,Overdue',
            'payment_method' => 'sometimes|required|string',
            'notes' => 'nullable|string',
        ]);

        $sale->update($validated);

        if (isset($validated['status']) && $sale->invoice) {
            $sale->invoice->update([
                'status' => $validated['status'] === 'Paid' ? 'Paid' : ($validated['status'] === 'Partial' ? 'Partially paid' : $validated['status']),
                'paid_amount' => $validated['status'] === 'Paid' ? $sale->total : 0,
            ]);
        }

        return response()->json($sale->load('items'));
    }

    public function destroy($id)
    {
        $sale = Sale::findOrFail($id);
        $orderNumber = $sale->order_number;
        $sale->delete();

        Activity::create([
            'message' => "Order {$orderNumber} was deleted",
            'actor' => request()->user()?->name ?? 'Admin',
            'type' => 'sale',
        ]);

        return response()->json(['message' => 'Sale deleted successfully']);
    }

    public function processReturn(Request $request, $id)
    {
        $sale = Sale::with('items')->findOrFail($id);

        if ($sale->status === 'Returned') {
            return response()->json(['message' => "Order {$sale->order_number} has already been processed for return."], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string',
            'restock' => 'nullable|boolean',
            'refund_amount' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($sale, $validated, $request) {
            $sale->update([
                'status' => 'Returned',
                'notes' => ($sale->notes ? $sale->notes . ' | ' : '') . "Return Reason: {$validated['reason']}",
            ]);

            // Adjust invoice status and cancel receivables/receivables
            if ($sale->invoice) {
                $sale->invoice->update([
                    'status' => 'Cancelled',
                ]);
            }

            // Adjust customer spent
            if ($sale->customer_id) {
                $customer = Customer::find($sale->customer_id);
                if ($customer && $customer->spent > 0) {
                    $customer->decrement('spent', min($customer->spent, $sale->total));
                }
            }

            $restockedCount = 0;
            if (!empty($validated['restock'])) {
                foreach ($sale->items as $item) {
                    if ($item->product_id) {
                        $prod = Product::lockForUpdate()->find($item->product_id);
                        if ($prod) {
                            $newStock = $prod->stock + $item->quantity;
                            $prod->update([
                                'stock' => $newStock,
                                'status' => $newStock <= 0 ? 'out_of_stock' : ($newStock <= $prod->threshold ? 'low_stock' : 'in_stock'),
                            ]);
                            $restockedCount += $item->quantity;
                        }
                    }
                }
            }

            \App\Models\AuditLog::create([
                'user_name' => $request->user()?->name ?? 'Sales Staff',
                'action' => 'Sales Return Processed',
                'module' => 'Sales',
                'record_reference' => $sale->order_number,
                'details' => "Order {$sale->order_number} returned. Reason: {$validated['reason']}." . ($restockedCount > 0 ? " Restocked {$restockedCount} units." : ' No restock.'),
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => "Order {$sale->order_number} marked as Returned.",
                'sale' => $sale,
            ]);
        });
    }
}

