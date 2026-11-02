<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $query = LeaveRequest::with(['employee', 'approver']);

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('leave_type')) {
            $query->where('leave_type', $request->leave_type);
        }

        $leaves = $query->orderBy('created_at', 'desc')->get();

        return response()->json($leaves);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'leave_type' => 'required|string|in:Casual Leave,Sick Leave,Annual Leave',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:1000',
        ]);

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        $daysCount = $start->diffInDays($end) + 1;

        $leave = LeaveRequest::create([
            'employee_id' => $validated['employee_id'],
            'leave_type' => $validated['leave_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'days_count' => $daysCount,
            'reason' => $validated['reason'],
            'status' => 'Pending',
        ]);

        Activity::create([
            'message' => 'Leave application submitted: ' . $leave->employee->name . ' (' . $leave->leave_type . ', ' . $daysCount . ' days)',
            'actor' => $request->user()?->name ?? 'Employee',
            'type' => 'hr',
        ]);

        return response()->json($leave->load(['employee', 'approver']), 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $leave = LeaveRequest::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:Approved,Rejected',
            'rejection_reason' => 'nullable|string',
        ]);

        $leave->update([
            'status' => $validated['status'],
            'approved_by' => $request->user()?->id,
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        // If approved, create/update attendance records as On Leave
        if ($validated['status'] === 'Approved') {
            $period = CarbonPeriod::create($leave->start_date, $leave->end_date);
            foreach ($period as $date) {
                Attendance::updateOrCreate(
                    [
                        'employee_id' => $leave->employee_id,
                        'date' => $date->toDateString(),
                    ],
                    [
                        'status' => 'On Leave',
                        'notes' => 'Approved ' . $leave->leave_type,
                    ]
                );
            }
        }

        Activity::create([
            'message' => 'Leave application ' . strtolower($validated['status']) . ' for ' . $leave->employee->name,
            'actor' => $request->user()?->name ?? 'Admin',
            'type' => 'hr',
        ]);

        return response()->json($leave->load(['employee', 'approver']));
    }

    public function balances(Request $request, $employeeId)
    {
        $employee = Employee::findOrFail($employeeId);
        $currentYear = now()->year;

        // Quotas standard for Bangladesh
        $quotas = [
            'Casual Leave' => 14,
            'Sick Leave' => 10,
            'Annual Leave' => 15,
        ];

        $approvedLeaves = LeaveRequest::where('employee_id', $employeeId)
            ->where('status', 'Approved')
            ->whereYear('start_date', $currentYear)
            ->get();

        $balances = [];
        foreach ($quotas as $type => $total) {
            $used = $approvedLeaves->where('leave_type', $type)->sum('days_count');
            $balances[] = [
                'type' => $type,
                'total' => $total,
                'used' => $used,
                'remaining' => max(0, $total - $used),
            ];
        }

        return response()->json([
            'employee' => $employee,
            'year' => $currentYear,
            'balances' => $balances,
        ]);
    }
}

