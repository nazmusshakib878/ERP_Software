<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErpApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_login_returns_token_and_user(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'shakib@nserp.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'name', 'email', 'role', 'workspace'],
            ]);
    }

    public function test_dashboard_stats(): void
    {
        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'kpis',
                'recent_orders',
                'recent_activities',
                'revenue_series',
                'revenue_by_category',
                'top_products',
            ]);
    }

    public function test_products_list_and_create(): void
    {
        $response = $this->getJson('/api/products');
        $response->assertStatus(200);

        $createResponse = $this->postJson('/api/products', [
            'name' => 'Mechanical Numpad',
            'sku' => 'NXR-9999',
            'category' => 'Electronics',
            'price' => 3500,
            'cost' => 2100,
            'stock' => 25,
            'warehouse' => 'Dhaka HQ',
        ]);

        $createResponse->assertStatus(201);
    }

    public function test_customers_list_and_create(): void
    {
        $response = $this->getJson('/api/customers');
        $response->assertStatus(200);

        $createResponse = $this->postJson('/api/customers', [
            'name' => 'Acme Corporation Ltd.',
            'email' => 'contact@acmecorp.com',
            'company' => 'Manufacturing',
            'tier' => 'Enterprise',
        ]);

        $createResponse->assertStatus(201);
    }

    public function test_sales_list_and_create(): void
    {
        $response = $this->getJson('/api/sales');
        $response->assertStatus(200);

        $createResponse = $this->postJson('/api/sales', [
            'customer_name' => 'Acme Corporation Ltd.',
            'customer_email' => 'contact@acmecorp.com',
            'payment_method' => 'Bank transfer',
            'status' => 'Paid',
            'items' => [
                [
                    'product_name' => 'Test Item',
                    'price' => 5000,
                    'quantity' => 2,
                ]
            ],
        ]);

        $createResponse->assertStatus(201);
    }

    public function test_5_primary_company_roles_login(): void
    {
        $rolesMap = [
            'shakib@nserp.com' => 'Company Admin',
            'manager@nserp.com' => 'Manager',
            'accountant@nserp.com' => 'Accountant',
            'staff@nserp.com' => 'Staff',
            'employee@nserp.com' => 'Employee',
        ];

        foreach ($rolesMap as $email => $expectedRole) {
            $res = $this->postJson('/api/login', [
                'email' => $email,
                'password' => 'password',
            ]);

            $res->assertStatus(200);
            $this->assertEquals($expectedRole, $res->json('user.role'));
            $this->assertNotEmpty($res->json('token'));
        }
    }

    public function test_stock_overselling_prevention(): void
    {
        $product = \App\Models\Product::first();
        $this->assertNotNull($product);

        // Try to order more than available stock
        $excessQuantity = $product->stock + 100;

        $response = $this->postJson('/api/sales', [
            'customer_name' => 'Over-buyer Corp',
            'payment_method' => 'Cash',
            'status' => 'Paid',
            'items' => [
                [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $product->price,
                    'quantity' => $excessQuantity,
                ]
            ],
        ]);

        $response->assertStatus(422);
    }

    public function test_goods_receiving_and_duplicate_prevention(): void
    {
        $purchase = \App\Models\Purchase::where('status', 'Pending')->first();
        $this->assertNotNull($purchase);
        $purchase->update(['items_count' => 10]);

        $product = \App\Models\Product::first();
        $initialStock = $product->stock;

        // 1. Receive goods
        $res = $this->postJson("/api/purchases/{$purchase->id}/receive", [
            'product_id' => $product->id,
            'quantity_received' => 10,
            'warehouse' => 'Dhaka HQ Central Warehouse',
        ]);

        $res->assertStatus(200);
        $product->refresh();
        $this->assertEquals($initialStock + 10, $product->stock);

        // 2. Try to receive the same PO again (Must prevent duplicate posting)
        $dupRes = $this->postJson("/api/purchases/{$purchase->id}/receive", [
            'product_id' => $product->id,
            'quantity_received' => 10,
        ]);

        $dupRes->assertStatus(422);
    }

    public function test_staff_permissions_update(): void
    {
        $staffUser = \App\Models\User::where('role', 'Staff')->first();
        $this->assertNotNull($staffUser);

        $res = $this->putJson("/api/users/{$staffUser->id}/permissions", [
            'role' => 'Staff',
            'allowed_modules' => ['Sales', 'Inventory'],
            'permissions' => ['sales.create', 'inventory.adjust'],
        ]);

        $res->assertStatus(200);
        $staffUser->refresh();
        $this->assertEquals(['Sales', 'Inventory'], $staffUser->allowed_modules);
    }
}
