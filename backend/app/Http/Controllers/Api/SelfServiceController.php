<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\Payroll;
use Illuminate\Http\Request;

class SelfServiceController extends Controller
{
    public function portal(Request $request)
    {
        $user = $request->user();
        $employee = null;

        if ($user) {
            $employee = Employee::where('email', $user->email)->first();
        }

        if (!$employee) {
            // Fallback for company admin or unlinked user testing the portal
            $employee = Employee::first();
        }

        if (!$employee) {
            return response()->json(['message' => 'No employee profile found.'], 404);
        }

        $today = now()->toDateString();
        $todayAttendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        $month = now()->format('Y-m');
        $monthlyAttendance = Attendance::where('employee_id', $employee->id)
            ->where('date', 'like', $month . '%')
            ->orderBy('date', 'desc')
            ->get();

        $quotas = [
            'Casual Leave' => 14,
            'Sick Leave' => 10,
            'Annual Leave' => 15,
        ];
        $currentYear = now()->year;
        $approvedLeaves = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'Approved')
            ->whereYear('start_date', $currentYear)
            ->get();

        $leaveBalances = [];
        foreach ($quotas as $type => $total) {
            $used = $approvedLeaves->where('leave_type', $type)->sum('days_count');
            $leaveBalances[] = [
                'type' => $type,
                'total' => $total,
                'used' => $used,
                'remaining' => max(0, $total - $used),
            ];
        }

        $recentLeaves = LeaveRequest::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $recentPayrolls = Payroll::where('employee_id', $employee->id)
            ->orderBy('month', 'desc')
            ->take(6)
            ->get();

        return response()->json([
            'employee' => $employee,
            'today_attendance' => $todayAttendance,
            'monthly_attendance' => $monthlyAttendance,
            'leave_balances' => $leaveBalances,
            'recent_leaves' => $recentLeaves,
            'recent_payrolls' => $recentPayrolls,
        ]);
    }
}

