<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with('employee');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->filled('month')) {
            $query->where('date', 'like', $request->month . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $attendances = $query->orderBy('date', 'desc')->orderBy('id', 'desc')->get();

        return response()->json($attendances);
    }

    public function summary(Request $request)
    {
        $date = $request->input('date', now()->toDateString());
        $totalEmployees = Employee::where('status', 'Active')->count();

        $presentCount = Attendance::whereDate('date', $date)
            ->where('status', 'Present')
            ->count();

        $lateCount = Attendance::whereDate('date', $date)
            ->where('status', 'Late')
            ->count();

        $onLeaveCount = Attendance::whereDate('date', $date)
            ->where('status', 'On Leave')
            ->count();

        $markedCount = Attendance::whereDate('date', $date)->count();
        $absentCount = max(0, $totalEmployees - $markedCount);

        return response()->json([
            'date' => $date,
            'total_employees' => $totalEmployees,
            'present' => $presentCount,
            'late' => $lateCount,
            'on_leave' => $onLeaveCount,
            'absent' => $absentCount,
        ]);
    }

    public function clockIn(Request $request)
    {
        $employeeId = $request->input('employee_id');

        if (!$employeeId && $request->user()) {
            $emp = Employee::where('email', $request->user()->email)->first();
            $employeeId = $emp?->id;
        }

        if (!$employeeId) {
            // Fallback to first active employee if not specified
            $employeeId = Employee::first()?->id;
        }

        if (!$employeeId) {
            return response()->json(['message' => 'No employee specified or found.'], 422);
        }

        $today = now()->toDateString();
        $existing = Attendance::where('employee_id', $employeeId)
            ->whereDate('date', $today)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Employee already clocked in for today.',
                'attendance' => $existing->load('employee'),
            ], 422);
        }

        $now = now();
        $clockInTime = $now->format('H:i:s');
        $status = $now->format('H:i') > '09:30' ? 'Late' : 'Present';

        $attendance = Attendance::create([
            'employee_id' => $employeeId,
            'date' => $today,
            'clock_in' => $clockInTime,
            'status' => $status,
            'notes' => $request->input('notes'),
        ]);

        return response()->json($attendance->load('employee'), 201);
    }

    public function clockOut(Request $request)
    {
        $employeeId = $request->input('employee_id');

        if (!$employeeId && $request->user()) {
            $emp = Employee::where('email', $request->user()->email)->first();
            $employeeId = $emp?->id;
        }

        if (!$employeeId) {
            $employeeId = Employee::first()?->id;
        }

        $today = now()->toDateString();
        $attendance = Attendance::where('employee_id', $employeeId)
            ->whereDate('date', $today)
            ->first();

        if (!$attendance) {
            return response()->json(['message' => 'No clock-in record found for today.'], 422);
        }

        if ($attendance->clock_out) {
            return response()->json(['message' => 'Employee already clocked out for today.'], 422);
        }

        $now = now();
        $clockOutTime = $now->format('H:i:s');

        // Calculate work hours
        $inTime = Carbon::parse($attendance->date->toDateString() . ' ' . $attendance->clock_in);
        $workHours = round($inTime->diffInMinutes($now) / 60, 2);

        $attendance->update([
            'clock_out' => $clockOutTime,
            'work_hours' => $workHours,
        ]);

        return response()->json($attendance->load('employee'));
    }

    public function record(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'clock_in' => 'nullable|string',
            'clock_out' => 'nullable|string',
            'status' => 'required|string|in:Present,Late,Absent,Half Day,On Leave',
            'notes' => 'nullable|string',
        ]);

        $workHours = 0;
        if (!empty($validated['clock_in']) && !empty($validated['clock_out'])) {
            $in = Carbon::parse($validated['date'] . ' ' . $validated['clock_in']);
            $out = Carbon::parse($validated['date'] . ' ' . $validated['clock_out']);
            $workHours = max(0, round($in->diffInMinutes($out) / 60, 2));
        }

        $attendance = Attendance::updateOrCreate(
            [
                'employee_id' => $validated['employee_id'],
                'date' => $validated['date'],
            ],
            [
                'clock_in' => $validated['clock_in'] ?? null,
                'clock_out' => $validated['clock_out'] ?? null,
                'status' => $validated['status'],
                'work_hours' => $workHours,
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return response()->json($attendance->load('employee'), 200);
    }
}

