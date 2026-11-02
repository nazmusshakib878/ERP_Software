<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRolePermission
{
    /**
     * Handle an incoming enterprise request.
     * Enforces Role-Based Access Control and Granular Staff Permissions on the backend.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated. Valid Bearer token is required for this enterprise resource.',
            ], 401);
        }

        // Super Admin and Company Admin have full unrestricted platform privileges
        if (in_array($user->role, ['Super Admin', 'Company Admin'])) {
            return $next($request);
        }

        // If specific roles are required, verify user's role is in the allowed list
        if (!empty($roles) && !in_array($user->role, $roles)) {
            return response()->json([
                'message' => "Access Denied: Your assigned role '{$user->role}' is not authorized to access this resource or execute this action.",
                'required_roles' => $roles,
            ], 403);
        }

        $path = $request->path();
        $method = $request->method();

        // Employee role isolation: strictly restricted to Self-Service & own profile
        if ($user->role === 'Employee') {
            $allowedEmployeePaths = [
                'api/me',
                'api/logout',
                'api/self-service',
                'api/attendances/clock-in',
                'api/attendances/clock-out',
                'api/attendances/summary',
                'api/leaves',
            ];

            $isAllowed = false;
            foreach ($allowedEmployeePaths as $allowedPrefix) {
                if (str_starts_with($path, $allowedPrefix)) {
                    $isAllowed = true;
                    break;
                }
            }

            if (!$isAllowed) {
                return response()->json([
                    'message' => "Access Denied: Employee role is restricted to Employee Self-Service, personal attendance, and leave requests.",
                ], 403);
            }

            // Employees cannot approve or reject leaves or modify attendance records of others
            if (str_contains($path, '/status') || str_contains($path, '/record') || $method === 'DELETE') {
                return response()->json([
                    'message' => "Access Denied: Employees do not possess managerial approval or deletion authority.",
                ], 403);
            }

            return $next($request);
        }

        // Staff role: Granular module and action permissions check
        if ($user->role === 'Staff') {
            $allowedModules = $user->allowed_modules ?? [];
            $userPerms = $user->permissions ?? [];
            $hasAllPerms = in_array('all', $userPerms) || empty($userPerms);

            $moduleMap = [
                'api/sales' => 'Sales',
                'api/products' => 'Products',
                'api/inventory' => 'Inventory',
                'api/purchases' => 'Purchases',
                'api/customers' => 'Customers',
                'api/employees' => 'Employees',
                'api/attendances' => 'Employees',
                'api/leaves' => 'Employees',
                'api/payrolls' => 'Finance',
                'api/invoices' => 'Finance',
                'api/finance' => 'Finance',
                'api/settings' => 'Settings',
                'api/audit-logs' => 'Settings',
            ];

            $currentModule = null;
            foreach ($moduleMap as $prefix => $modName) {
                if (str_starts_with($path, $prefix)) {
                    $currentModule = $modName;
                    break;
                }
            }

            if ($currentModule) {
                // Verify module access
                if (!empty($allowedModules) && !in_array($currentModule, $allowedModules)) {
                    return response()->json([
                        'message' => "Access Denied: Your Staff account has not been granted access to the '{$currentModule}' module.",
                        'assigned_modules' => $allowedModules,
                    ], 403);
                }

                // Verify action permissions if not assigned 'all'
                if (!$hasAllPerms) {
                    $modLower = strtolower($currentModule);

                    if ($method === 'DELETE') {
                        $canDelete = in_array('delete', $userPerms) || in_array("{$modLower}.delete", $userPerms);
                        if (!$canDelete) {
                            return response()->json([
                                'message' => "Access Denied: Your Staff account lacks 'Delete' permission for the {$currentModule} module.",
                            ], 403);
                        }
                    } elseif ($method === 'POST') {
                        if (str_contains($path, 'adjust')) {
                            $canAdjust = in_array('stock_adjustment', $userPerms) || in_array('inventory.adjust', $userPerms);
                            if (!$canAdjust) {
                                return response()->json([
                                    'message' => "Access Denied: Your Staff account lacks 'Stock Adjustment' permission.",
                                ], 403);
                            }
                        } else {
                            $canCreate = in_array('create', $userPerms) || in_array("{$modLower}.create", $userPerms);
                            if (!$canCreate) {
                                return response()->json([
                                    'message' => "Access Denied: Your Staff account lacks 'Create' permission for the {$currentModule} module.",
                                ], 403);
                            }
                        }
                    } elseif (in_array($method, ['PUT', 'PATCH'])) {
                        if (str_contains($path, 'status') || str_contains($path, 'approve')) {
                            $canApprove = in_array('approve', $userPerms) || in_array("{$modLower}.approve", $userPerms);
                            if (!$canApprove) {
                                return response()->json([
                                    'message' => "Access Denied: Your Staff account lacks 'Approve' permission for this record.",
                                ], 403);
                            }
                        } else {
                            $canEdit = in_array('edit', $userPerms) || in_array("{$modLower}.edit", $userPerms);
                            if (!$canEdit) {
                                return response()->json([
                                    'message' => "Access Denied: Your Staff account lacks 'Edit' permission for the {$currentModule} module.",
                                ], 403);
                            }
                        }
                    }
                }
            }
        }

        return $next($request);
    }
}
