<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Warehouse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index()
    {
        return response()->json(Warehouse::orderBy('id', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|unique:warehouses,code|max:30',
            'location' => 'required|string',
            'city' => 'nullable|string',
            'capacity' => 'nullable|integer',
            'manager_name' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $wh = Warehouse::create($validated);

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Admin',
            'action' => 'Warehouse Created',
            'module' => 'Inventory',
            'record_reference' => $wh->code,
            'details' => "Warehouse '{$wh->name}' ({$wh->code}) created in {$wh->city}.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($wh, 201);
    }
}

