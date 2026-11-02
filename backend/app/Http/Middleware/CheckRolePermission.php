<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRolePermission
{
    /**
     * Handle an incoming request.
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

        // Super Admin and Company Admin have unrestricted platform permissions
        if (in_array($user->role, ['Super Admin', 'Company Admin'])) {
            return $next($request);
        }

        // Check if user's role matches any of the allowed roles
        if (! in_array($user->role, $roles)) {
            return response()->json([
                'message' => "Access Denied: Your assigned role '{$user->role}' is not authorized to access this resource or execute this action.",
                'required_roles' => $roles,
            ], 403);
        }

        // If the user has role 'Staff', check module-specific permissions where applicable
        if ($user->role === 'Staff' && !empty($user->allowed_modules)) {
            $path = $request->path();
            $moduleMap = [
                'api/sales' => 'Sales',
                'api/products' => 'Products',
                'api/inventory' => 'Inventory',
                'api/purchases' => 'Purchases',
                'api/customers' => 'Customers',
                'api/employees' => 'Employees',
                'api/invoices' => 'Finance',
                'api/settings' => 'Settings',
            ];

            foreach ($moduleMap as $prefix => $modName) {
                if (str_starts_with($path, $prefix)) {
                    if (!in_array($modName, $user->allowed_modules)) {
                        return response()->json([
                            'message' => "Access Denied: Your Staff account has not been granted access to the '{$modName}' module.",
                            'assigned_modules' => $user->allowed_modules,
                        ], 403);
                    }
                }
            }
        }

        return $next($request);
    }
}
