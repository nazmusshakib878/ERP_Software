<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $token = $user->createToken('erp-auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'initials' => $user->initials ?: strtoupper(substr($user->name, 0, 2)),
                'avatar' => $user->avatar,
                'workspace' => $user->workspace,
                'allowed_modules' => $user->allowed_modules ?? ($user->role === 'Staff' ? ['Sales', 'Inventory', 'Products', 'Purchases'] : ['Dashboard', 'Sales', 'Inventory', 'Products', 'Purchases', 'Customers', 'Employees', 'Finance', 'Analytics', 'Settings']),
                'permissions' => $user->permissions ?? ['all'],
            ],
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'initials' => $user->initials ?: strtoupper(substr($user->name, 0, 2)),
                'avatar' => $user->avatar,
                'workspace' => $user->workspace,
                'allowed_modules' => $user->allowed_modules ?? ($user->role === 'Staff' ? ['Sales', 'Inventory', 'Products', 'Purchases'] : ['Dashboard', 'Sales', 'Inventory', 'Products', 'Purchases', 'Customers', 'Employees', 'Finance', 'Analytics', 'Settings']),
                'permissions' => $user->permissions ?? ['all'],
            ],
        ]);
    }
}

