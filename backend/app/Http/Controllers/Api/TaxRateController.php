<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\TaxRate;
use Illuminate\Http\Request;

class TaxRateController extends Controller
{
    public function index()
    {
        return response()->json(TaxRate::orderBy('id', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'rate' => 'required|numeric|min:0|max:100',
            'type' => 'nullable|string',
            'is_default' => 'nullable|boolean',
            'status' => 'nullable|string',
        ]);

        if (!empty($validated['is_default'])) {
            TaxRate::where('is_default', true)->update(['is_default' => false]);
        }

        $tax = TaxRate::create($validated);

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Admin',
            'action' => 'Tax Rate Added',
            'module' => 'Settings',
            'record_reference' => $tax->name,
            'details' => "Tax rate '{$tax->name}' ({$tax->rate}%) configured.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($tax, 201);
    }
}

