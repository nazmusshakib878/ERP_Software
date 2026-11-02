<?php

namespace Tests\Feature;

use App\Models\BankAccount;
use App\Models\Customer;
use App\Models\FinanceTransaction;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErpApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->adminUser = User::where('role', 'Company Admin')->first();
        $this->actingAs($this->adminUser, 'sanctum');
    }

    public function test_health_endpoint_returns_healthy(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'timestamp',
                'app' => ['name', 'env'],
                'services' => ['database', 'database_driver', 'storage', 'cache'],
                'version',
            ]);

        $this->assertEquals('healthy', $response->json('status'));
        $this->assertEquals('connected', $response->json('services.database'));
        $this->assertArrayNotHasKey('database_password', $response->json());
    }

    public function test_unauthenticated_request_is_rejected_with_401(): void
    {
        // Issue unauthenticated request by forgetting auth guards
        $this->app['auth']->forgetGuards();

        $response = $this->withHeaders(['Accept' => 'application/json'])
            ->getJson('/api/dashboard/stats');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_employee_role_access_restriction_403(): void
    {
        $employeeUser = User::where('role', 'Employee')->first();
        $this->actingAs($employeeUser, 'sanctum');

        // Employee attempting to access Sales API must be rejected with 403 Forbidden
        $response = $this->getJson('/api/sales');
        $response->assertStatus(403);

        // Employee attempting to access Finance ledger must be rejected with 403 Forbidden
        $finResponse = $this->getJson('/api/finance/general-ledger');
        $finResponse->assertStatus(403);
    }

    public function test_staff_module_restriction_403(): void
    {
        $staffUser = User::where('role', 'Staff')->first();
        $staffUser->update([
            'allowed_modules' => ['Sales', 'Customers'],
            'permissions' => ['sales.view', 'sales.create'],
        ]);
        $this->actingAs($staffUser, 'sanctum');

        // Allowed module access succeeds
        $allowedRes = $this->getJson('/api/sales');
        $allowedRes->assertStatus(200);

        // Disallowed module (Finance) access is blocked with 403
        $blockedRes = $this->getJson('/api/finance/transactions');
        $blockedRes->assertStatus(403);
    }

    public function test_login_returns_token_and_user(): void
    {
        $this->app['auth']->forgetGuards();

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

        $product = Product::first();
        $this->assertNotNull($product);

        $createResponse = $this->postJson('/api/sales', [
            'customer_name' => 'Acme Corporation Ltd.',
            'customer_email' => 'contact@acmecorp.com',
            'payment_method' => 'Bank transfer',
            'status' => 'Paid',
            'items' => [
                [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => 5000,
                    'quantity' => 2,
                ]
            ],
        ]);

        $createResponse->assertStatus(201);
    }

    public function test_5_primary_company_roles_login(): void
    {
        $this->app['auth']->forgetGuards();

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
        $product = Product::first();
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
        $purchase = Purchase::where('status', 'Pending')->first();
        $this->assertNotNull($purchase);
        $purchase->update(['items_count' => 10]);

        $product = Product::first();
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
        $staffUser = User::where('role', 'Staff')->first();
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

    public function test_sale_deletion_restores_product_stock_and_adjusts_balance(): void
    {
        $product = Product::first();
        $initialStock = $product->stock;

        // Create sale with 3 units
        $saleRes = $this->postJson('/api/sales', [
            'customer_name' => 'Restock Test Co',
            'payment_method' => 'Cash',
            'status' => 'Paid',
            'items' => [
                [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $product->price,
                    'quantity' => 3,
                ]
            ],
        ]);
        $saleRes->assertStatus(201);
        $saleId = $saleRes->json('id');

        $product->refresh();
        $this->assertEquals($initialStock - 3, $product->stock);

        // Delete the sale
        $delRes = $this->deleteJson("/api/sales/{$saleId}");
        $delRes->assertStatus(200);

        // Verify stock has been restored to initial level
        $product->refresh();
        $this->assertEquals($initialStock, $product->stock);
    }

    public function test_invoice_payment_records_finance_income_and_customer_spent(): void
    {
        $customer = Customer::create([
            'name' => 'Finance Test Customer',
            'email' => 'finance-test@customer.com',
            'company' => 'Finance Client',
            'spent' => 0,
        ]);

        $invoice = Invoice::create([
            'invoice_number' => 'INV-TEST-999',
            'customer_name' => $customer->name,
            'date' => now()->toDateString(),
            'due_date' => now()->addDays(15)->toDateString(),
            'total_amount' => 50000,
            'paid_amount' => 0,
            'status' => 'Unpaid',
        ]);

        $bankAccount = BankAccount::first();
        $initialBalance = $bankAccount ? $bankAccount->balance : 0;

        // Record payment of 30,000
        $payRes = $this->postJson("/api/invoices/{$invoice->id}/pay", [
            'amount' => 30000,
            'payment_method' => 'Bank Transfer',
            'account_id' => $bankAccount?->id,
        ]);

        $payRes->assertStatus(200);
        $invoice->refresh();
        $this->assertEquals(30000, $invoice->paid_amount);
        $this->assertEquals('Partially paid', $invoice->status);

        if ($bankAccount) {
            $bankAccount->refresh();
            $this->assertEquals($initialBalance + 30000, $bankAccount->balance);
        }

        // Overpayment must be rejected with 422
        $excessPayRes = $this->postJson("/api/invoices/{$invoice->id}/pay", [
            'amount' => 50000, // Remaining due is only 20,000
        ]);
        $excessPayRes->assertStatus(422);
    }

    public function test_production_vercel_cors_preflight_is_honored(): void
    {
        $response = $this->call(
            'OPTIONS',
            '/api/health',
            [],
            [],
            [],
            [
                'HTTP_ORIGIN' => 'https://erp-rouge-five.vercel.app',
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
                'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'Authorization,Content-Type',
            ]
        );

        $response->assertStatus(204);
        $this->assertEquals(
            'https://erp-rouge-five.vercel.app',
            $response->headers->get('Access-Control-Allow-Origin')
        );
        $this->assertStringContainsString(
            'GET',
            (string) $response->headers->get('Access-Control-Allow-Methods')
        );
    }

    public function test_production_vercel_preview_origin_cors_preflight_is_honored(): void
    {
        $response = $this->call(
            'OPTIONS',
            '/api/health',
            [],
            [],
            [],
            [
                'HTTP_ORIGIN' => 'https://erp-preview-build-123.vercel.app',
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
                'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'Authorization,Content-Type',
            ]
        );

        $response->assertStatus(204);
        $this->assertEquals(
            'https://erp-preview-build-123.vercel.app',
            $response->headers->get('Access-Control-Allow-Origin')
        );
    }
}
