<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $query = Purchase::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'like', "%{$search}%")
                  ->orWhere('supplier_name', 'like', "%{$search}%")
                  ->orWhere('rep_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $purchases = $query->orderBy('date', 'desc')->get();

        return response()->json($purchases);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_name' => 'required|string|max:255',
            'supplier_email' => 'nullable|email',
            'items_count' => 'required|integer|min:1',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'nullable|string|in:Received,Pending,Partially received,Cancelled',
            'notes' => 'nullable|string',
        ]);

        $year = date('Y');
        $validated['po_number'] = 'PO-' . $year . '-' . str_pad((string) (286 + Purchase::count() + 1), 4, '0', STR_PAD_LEFT);
        $validated['status'] = $validated['status'] ?? 'Pending';
        $validated['rep_name'] = $request->user()?->name ?? 'Admin';
        $validated['date'] = now()->toDateString();

        $purchase = Purchase::create($validated);

        Activity::create([
            'message' => 'New purchase order created: ' . $purchase->po_number . ' for ' . $purchase->supplier_name,
            'actor' => $request->user()?->name ?? 'Admin',
            'type' => 'purchase',
        ]);

        return response()->json($purchase, 201);
    }

    public function update(Request $request, $id)
    {
        $purchase = Purchase::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|required|string|in:Received,Pending,Partially received,Cancelled',
            'notes' => 'nullable|string',
        ]);

        $purchase->update($validated);

        return response()->json($purchase);
    }

    public function destroy($id)
    {
        $purchase = Purchase::findOrFail($id);
        $po = $purchase->po_number;
        $purchase->delete();

        return response()->json(['message' => "Purchase order {$po} deleted successfully"]);
    }

    public function receiveGoods(Request $request, $id)
    {
        $purchase = Purchase::findOrFail($id);

        if ($purchase->status === 'Received' || ($purchase->received_quantity >= $purchase->items_count && $purchase->items_count > 0)) {
            return response()->json([
                'message' => "Purchase order {$purchase->po_number} has already been fully received and posted to stock.",
            ], 422);
        }

        $validated = $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'quantity_received' => 'required|integer|min:1',
            'warehouse' => 'nullable|string',
        ]);

        $receivedQty = (int) $validated['quantity_received'];
        $remainingExpected = max(0, $purchase->items_count - $purchase->received_quantity);

        if ($purchase->items_count > 0 && $receivedQty > $remainingExpected) {
            return response()->json([
                'message' => "Cannot receive {$receivedQty} units. Maximum remaining receivable quantity for PO {$purchase->po_number} is {$remainingExpected} units.",
            ], 422);
        }

        return DB::transaction(function () use ($purchase, $validated, $receivedQty, $request) {
            $product = null;
            if (!empty($validated['product_id'])) {
                $product = Product::lockForUpdate()->find($validated['product_id']);
                if ($product) {
                    $newStock = $product->stock + $receivedQty;
                    $product->update([
                        'stock' => $newStock,
                        'status' => $newStock <= 0 ? 'out_of_stock' : ($newStock <= $product->threshold ? 'low_stock' : 'in_stock'),
                    ]);
                }
            }

            $newTotalReceived = $purchase->received_quantity + $receivedQty;
            $newStatus = ($newTotalReceived >= $purchase->items_count) ? 'Received' : 'Partially received';

            $history = $purchase->receiving_history ?? [];
            $history[] = [
                'receipt_number' => 'REC-' . strtoupper(uniqid()),
                'quantity' => $receivedQty,
                'warehouse' => $validated['warehouse'] ?? 'Dhaka HQ',
                'received_by' => $request->user()?->name ?? 'Purchase Officer',
                'date' => now()->toIso8601String(),
            ];

            $purchase->update([
                'received_quantity' => $newTotalReceived,
                'status' => $newStatus,
                'receiving_history' => $history,
                'notes' => ($purchase->notes ? $purchase->notes . ' | ' : '') . "Received {$receivedQty} units at " . ($validated['warehouse'] ?? 'Dhaka HQ') . ' on ' . now()->toDateString(),
            ]);

            AuditLog::create([
                'user_name' => $request->user()?->name ?? 'Purchase Officer',
                'action' => 'Goods Received & Stock Posted',
                'module' => 'Purchases',
                'record_reference' => $purchase->po_number,
                'details' => "Received {$receivedQty} units for {$purchase->po_number} (Total Received: {$newTotalReceived}/{$purchase->items_count}) from {$purchase->supplier_name}." . ($product ? " Stock of '{$product->name}' increased by {$receivedQty} to {$product->stock}." : ''),
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'purchase' => $purchase,
                'product' => $product,
                'message' => "{$receivedQty} units for {$purchase->po_number} successfully received into inventory.",
            ]);
        });
    }
}

