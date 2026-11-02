<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('permissions')->nullable()->after('role');
            $table->json('allowed_modules')->nullable()->after('permissions');
        });

        // Safely migrate existing legacy specialized roles to 'Staff' with their proper module permissions
        if (Schema::hasTable('users')) {
            DB::table('users')->where('role', 'Sales Staff')->update([
                'role' => 'Staff',
                'allowed_modules' => json_encode(['Sales', 'Customers']),
                'permissions' => json_encode(['sales.view', 'sales.create', 'sales.edit', 'customers.view', 'customers.create']),
            ]);

            DB::table('users')->where('role', 'Inventory Manager')->update([
                'role' => 'Staff',
                'allowed_modules' => json_encode(['Inventory', 'Products']),
                'permissions' => json_encode(['inventory.view', 'inventory.adjust', 'inventory.transfer', 'products.view', 'products.create', 'products.edit']),
            ]);

            DB::table('users')->where('role', 'Purchase Officer')->update([
                'role' => 'Staff',
                'allowed_modules' => json_encode(['Purchases', 'Products']),
                'permissions' => json_encode(['purchases.view', 'purchases.create', 'purchases.receive_goods', 'products.view']),
            ]);

            DB::table('users')->where('role', 'HR Manager')->update([
                'role' => 'Staff',
                'allowed_modules' => json_encode(['Employees']),
                'permissions' => json_encode(['employees.view', 'employees.create', 'employees.edit', 'employees.payroll', 'employees.leave_approval']),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['allowed_modules', 'permissions']);
        });
    }
};
