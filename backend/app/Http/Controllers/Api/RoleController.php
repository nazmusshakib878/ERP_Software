<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        // Primary company roles (Super Admin is separate/system)
        $roles = Role::with('permissions')->orderBy('hierarchy_level', 'desc')->get();
        $permissions = Permission::all();
        $users = User::all(['id', 'name', 'email', 'role', 'workspace', 'avatar', 'initials', 'allowed_modules', 'permissions']);

        return response()->json([
            'roles' => $roles,
            'permissions' => $permissions,
            'users' => $users,
        ]);
    }

    public function updateUserPermissions(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'role' => 'sometimes|required|string',
            'allowed_modules' => 'nullable|array',
            'permissions' => 'nullable|array',
        ]);

        if (isset($validated['role'])) {
            $user->role = $validated['role'];
        }
        if (isset($validated['allowed_modules'])) {
            $user->allowed_modules = $validated['allowed_modules'];
        }
        if (isset($validated['permissions'])) {
            $user->permissions = $validated['permissions'];
        }
        $user->save();

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Company Admin',
            'action' => 'Updated Staff Permissions',
            'module' => 'Settings',
            'record_reference' => $user->email,
            'details' => "Updated permissions for user '{$user->name}' ({$user->email}). Assigned role: {$user->role}.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Permissions for user '{$user->name}' updated successfully.",
            'user' => $user,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|unique:roles,slug|max:50',
            'description' => 'nullable|string',
            'hierarchy_level' => 'nullable|integer',
        ]);

        $role = Role::create($validated);

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Admin',
            'action' => 'Created Role',
            'module' => 'Settings',
            'record_reference' => $role->slug,
            'details' => "Role '{$role->name}' created.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($role, 201);
    }
}

