<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::orderBy('id', 'desc');

        if ($request->has('module') && $request->module !== 'All') {
            $query->where('module', $request->module);
        }

        if ($request->has('search') && !empty($request->search)) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('user_name', 'like', "%{$s}%")
                  ->orWhere('action', 'like', "%{$s}%")
                  ->orWhere('details', 'like', "%{$s}%")
                  ->orWhere('record_reference', 'like', "%{$s}%");
            });
        }

        return response()->json($query->take(100)->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string',
            'module' => 'required|string',
            'record_reference' => 'nullable|string',
            'details' => 'nullable|string',
        ]);

        $log = AuditLog::create([
            'user_id' => $request->user()?->id,
            'user_name' => $request->user()?->name ?? 'Admin',
            'action' => $validated['action'],
            'module' => $validated['module'],
            'record_reference' => $validated['record_reference'] ?? null,
            'details' => $validated['details'] ?? null,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return response()->json($log, 201);
    }
}

