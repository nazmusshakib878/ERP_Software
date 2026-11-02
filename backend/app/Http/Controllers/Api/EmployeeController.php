<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('role', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
            });
        }

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $employees = $query->orderBy('id', 'desc')->get();

        return response()->json($employees);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string',
            'department' => 'required|string',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'nullable|string',
            'hire_date' => 'nullable|date',
            'status' => 'nullable|string|in:Active,On leave,Inactive',
            'salary' => 'nullable|numeric|min:0',
        ]);

        $validated['code'] = 'e-' . str_pad((string) (Employee::max('id') + 1), 3, '0', STR_PAD_LEFT);
        $validated['status'] = $validated['status'] ?? 'Active';
        $validated['hire_date'] = $validated['hire_date'] ?? now()->toDateString();
        $validated['avatar'] = strtolower(explode(' ', $validated['name'])[0]);

        $employee = Employee::create($validated);

        Activity::create([
            'message' => 'New team member added: ' . $employee->name . ' (' . $employee->role . ')',
            'actor' => $request->user()?->name ?? 'Admin',
            'type' => 'hr',
        ]);

        return response()->json($employee, 201);
    }

    public function show($id)
    {
        $employee = Employee::findOrFail($id);
        return response()->json($employee);
    }

    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|string',
            'department' => 'sometimes|required|string',
            'email' => 'sometimes|required|email|unique:employees,email,' . $employee->id,
            'phone' => 'nullable|string',
            'hire_date' => 'nullable|date',
            'status' => 'nullable|string|in:Active,On leave,Inactive',
            'salary' => 'nullable|numeric|min:0',
        ]);

        $employee->update($validated);

        return response()->json($employee);
    }

    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);
        $name = $employee->name;
        $employee->delete();

        Activity::create([
            'message' => 'Employee profile removed: ' . $name,
            'actor' => request()->user()?->name ?? 'Admin',
            'type' => 'hr',
        ]);

        return response()->json(['message' => 'Employee deleted successfully']);
    }
}

