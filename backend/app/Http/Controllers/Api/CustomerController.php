<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('tier')) {
            $query->where('tier', $request->tier);
        }

        $customers = $query->orderBy('id', 'desc')->get();

        return response()->json($customers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'phone' => 'nullable|string',
            'company' => 'required|string',
            'company_type' => 'nullable|string',
            'spent' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:active,inactive',
            'tier' => 'nullable|string|in:Enterprise,Business,Standard',
            'address' => 'nullable|string',
        ]);

        $validated['code'] = 'c-' . str_pad((string) (Customer::max('id') + 1), 3, '0', STR_PAD_LEFT);
        $validated['spent'] = $validated['spent'] ?? 0;
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['tier'] = $validated['tier'] ?? 'Business';

        $customer = Customer::create($validated);

        Activity::create([
            'message' => 'New customer registered: ' . $customer->name,
            'actor' => $request->user()?->name ?? 'Admin',
            'type' => 'crm',
        ]);

        return response()->json($customer, 201);
    }

    public function show($id)
    {
        $customer = Customer::with('sales')->findOrFail($id);
        return response()->json($customer);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:customers,email,' . $customer->id,
            'phone' => 'nullable|string',
            'company' => 'sometimes|required|string',
            'company_type' => 'nullable|string',
            'spent' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:active,inactive',
            'tier' => 'nullable|string|in:Enterprise,Business,Standard',
            'address' => 'nullable|string',
        ]);

        $customer->update($validated);

        return response()->json($customer);
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $name = $customer->name;
        $customer->delete();

        Activity::create([
            'message' => 'Customer removed: ' . $name,
            'actor' => request()->user()?->name ?? 'Admin',
            'type' => 'crm',
        ]);

        return response()->json(['message' => 'Customer deleted successfully']);
    }
}

