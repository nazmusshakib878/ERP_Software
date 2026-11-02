<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\AuditLog;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('warehouse', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('warehouse')) {
            $query->where('warehouse', $request->warehouse);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $products = $query->orderBy('id', 'desc')->get();

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'reserved' => 'nullable|integer|min:0',
            'threshold' => 'nullable|integer|min:0',
            'warehouse' => 'nullable|string',
            'image' => 'nullable|string',
            'status' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $threshold = $validated['threshold'] ?? 10;
        $stock = $validated['stock'];
        $status = $stock <= 0 ? 'out_of_stock' : ($stock <= $threshold ? 'low_stock' : 'in_stock');
        $validated['status'] = $status;
        $validated['code'] = 'p-' . str_pad((string) (Product::max('id') + 1), 3, '0', STR_PAD_LEFT);

        $product = Product::create($validated);

        Activity::create([
            'message' => 'New product created: ' . $product->name . ' (' . $product->sku . ')',
            'actor' => $request->user()?->name ?? 'Admin',
            'type' => 'inventory',
        ]);

        return response()->json($product, 201);
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'sku' => 'sometimes|required|string|unique:products,sku,' . $product->id,
            'category' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'reserved' => 'nullable|integer|min:0',
            'threshold' => 'nullable|integer|min:0',
            'warehouse' => 'nullable|string',
            'image' => 'nullable|string',
            'status' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        if (isset($validated['stock'])) {
            $threshold = $validated['threshold'] ?? $product->threshold;
            $stock = $validated['stock'];
            $validated['status'] = $stock <= 0 ? 'out_of_stock' : ($stock <= $threshold ? 'low_stock' : 'in_stock');
        }

        $product->update($validated);

        Activity::create([
            'message' => 'Product updated: ' . $product->name,
            'actor' => $request->user()?->name ?? 'Admin',
            'type' => 'inventory',
        ]);

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $name = $product->name;
        $product->delete();

        Activity::create([
            'message' => 'Product deleted: ' . $name,
            'actor' => request()->user()?->name ?? 'Admin',
            'type' => 'inventory',
        ]);

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function transferStock(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'from_warehouse' => 'required|string',
            'to_warehouse' => 'required|string|different:from_warehouse',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $sourceProduct = Product::lockForUpdate()->findOrFail($validated['product_id']);

            if ($sourceProduct->stock < $validated['quantity']) {
                return response()->json([
                    'message' => "Insufficient stock available for transfer from {$validated['from_warehouse']}. Current stock: {$sourceProduct->stock}, requested: {$validated['quantity']}",
                ], 422);
            }

            // Deduct from source warehouse
            $newSourceStock = $sourceProduct->stock - $validated['quantity'];
            $sourceProduct->update([
                'stock' => $newSourceStock,
                'status' => $newSourceStock <= 0 ? 'out_of_stock' : ($newSourceStock <= $sourceProduct->threshold ? 'low_stock' : 'in_stock'),
            ]);

            // Add or find destination warehouse product
            $destProduct = Product::lockForUpdate()
                ->where('warehouse', $validated['to_warehouse'])
                ->where(function ($q) use ($sourceProduct) {
                    $q->where('sku', $sourceProduct->sku)
                      ->orWhere('name', $sourceProduct->name);
                })
                ->first();

            if ($destProduct) {
                $newDestStock = $destProduct->stock + $validated['quantity'];
                $destProduct->update([
                    'stock' => $newDestStock,
                    'status' => $newDestStock <= 0 ? 'out_of_stock' : ($newDestStock <= $destProduct->threshold ? 'low_stock' : 'in_stock'),
                ]);
            } else {
                $whCode = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $validated['to_warehouse']), 0, 3));
                $newSku = $sourceProduct->sku . '-' . $whCode;
                if (Product::where('sku', $newSku)->exists()) {
                    $newSku = $newSku . '-' . rand(10, 99);
                }

                $destProduct = Product::create([
                    'code' => 'p-' . str_pad((string) (Product::max('id') + 1), 3, '0', STR_PAD_LEFT),
                    'name' => $sourceProduct->name,
                    'sku' => $newSku,
                    'category' => $sourceProduct->category,
                    'price' => $sourceProduct->price,
                    'cost' => $sourceProduct->cost,
                    'stock' => $validated['quantity'],
                    'reserved' => 0,
                    'threshold' => $sourceProduct->threshold,
                    'warehouse' => $validated['to_warehouse'],
                    'image' => $sourceProduct->image,
                    'status' => $validated['quantity'] <= $sourceProduct->threshold ? 'low_stock' : 'in_stock',
                    'description' => $sourceProduct->description,
                ]);
            }

            $ref = 'TRF-' . strtoupper(uniqid());
            AuditLog::create([
                'user_name' => $request->user()?->name ?? 'Inventory Manager',
                'action' => 'Warehouse Stock Transfer',
                'module' => 'Inventory',
                'record_reference' => $ref,
                'details' => "Transferred {$validated['quantity']} units of '{$sourceProduct->name}' from {$validated['from_warehouse']} to {$validated['to_warehouse']}. Source stock: {$newSourceStock}, Destination stock: {$destProduct->stock}." . (!empty($validated['notes']) ? " Note: {$validated['notes']}" : ''),
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => "Successfully transferred {$validated['quantity']} units of {$sourceProduct->name} from {$validated['from_warehouse']} to {$validated['to_warehouse']}.",
                'reference' => $ref,
                'source_product' => $sourceProduct,
                'dest_product' => $destProduct,
            ]);
        });
    }

    public function adjustStock(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'adjustment_type' => 'required|string|in:Damage,Lost,Audit Reconciliation,Demo / Sample,Other Authorized Adjustment',
            'quantity' => 'required|integer', // positive or negative
            'reason' => 'required|string|min:3',
            'warehouse' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);
            $currentStock = $product->stock;
            $newStock = $currentStock + (int) $validated['quantity'];

            if ($newStock < 0) {
                return response()->json([
                    'message' => "Stock cannot become negative. Available on-hand: {$currentStock}, Requested adjustment: {$validated['quantity']}.",
                ], 422);
            }

            $status = $newStock <= 0 ? 'out_of_stock' : ($newStock <= $product->threshold ? 'low_stock' : 'in_stock');
            $product->update([
                'stock' => $newStock,
                'status' => $status,
            ]);

            $deltaStr = $validated['quantity'] > 0 ? "+{$validated['quantity']}" : (string) $validated['quantity'];
            $ref = 'ADJ-' . strtoupper(uniqid());

            AuditLog::create([
                'user_name' => $request->user()?->name ?? 'Inventory Staff',
                'action' => "Stock Adjusted ({$validated['adjustment_type']})",
                'module' => 'Inventory',
                'record_reference' => $ref,
                'details' => "Adjusted '{$product->name}' ({$product->sku}) by {$deltaStr} units ({$currentStock} -> {$newStock}) at {$product->warehouse}. Reason: {$validated['reason']}",
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => "Stock for {$product->name} successfully adjusted from {$currentStock} to {$newStock}.",
                'reference' => $ref,
                'product' => $product,
                'previous_stock' => $currentStock,
                'new_stock' => $newStock,
            ]);
        });
    }
}

