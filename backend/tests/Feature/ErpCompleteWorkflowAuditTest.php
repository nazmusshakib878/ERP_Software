<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErpCompleteWorkflowAuditTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    /**
     * Section 3: Purchase -> Goods Receiving -> Inventory Test
     */
    public function test_purchase_lifecycle_with_partial_and_full_goods_receiving(): void
    {
        // 1. Initial product with exactly 50 units
        $product = Product::create([
            'code' => 'p-test-01',
            'name' => 'Enterprise Audit Switch',
            'sku' => 'AUDIT-SW-50',
            'category' => 'Networking',
            'price' => 15000,
            'cost' => 10000,
            'stock' => 50,
            'threshold' => 10,
            'warehouse' => 'Dhaka HQ Central Warehouse',
            'status' => 'in_stock',
        ]);
        $this->assertEquals(50, $product->stock);

        // 2. Create PO for 20 units (Initial creation must NOT increase stock)
        $poRes = $this->postJson('/api/purchases', [
            'supplier_name' => 'Cisco Systems BD',
            'items_count' => 20,
            'total_amount' => 200000,
            'status' => 'Pending',
        ]);
        $poRes->assertStatus(201);
        $poId = $poRes->json('id');
        $this->assertEquals(50, $product->fresh()->stock, 'Creating PO must NOT increase physical stock');

        // 3. Receive partial shipment: 12 units -> Stock must become 62
        $rcv1 = $this->postJson("/api/purchases/{$poId}/receive", [
            'product_id' => $product->id,
            'quantity_received' => 12,
            'warehouse' => 'Dhaka HQ Central Warehouse',
        ]);
        $rcv1->assertStatus(200);
        $this->assertEquals(62, $product->fresh()->stock);
        $po = Purchase::find($poId);
        $this->assertEquals('Partially received', $po->status);
        $this->assertEquals(12, $po->received_quantity);

        // 4. Attempt to receive more than remaining quantity (e.g. 10 units when only 8 remain) must fail
        $overRcv = $this->postJson("/api/purchases/{$poId}/receive", [
            'product_id' => $product->id,
            'quantity_received' => 10,
        ]);
        $overRcv->assertStatus(422);
        $this->assertEquals(62, $product->fresh()->stock, 'Failed over-receipt must not modify stock');

        // 5. Receive remaining 8 units -> Stock must become 70
        $rcv2 = $this->postJson("/api/purchases/{$poId}/receive", [
            'product_id' => $product->id,
            'quantity_received' => 8,
            'warehouse' => 'Dhaka HQ Central Warehouse',
        ]);
        $rcv2->assertStatus(200);
        $this->assertEquals(70, $product->fresh()->stock);
        $po->refresh();
        $this->assertEquals('Received', $po->status);
        $this->assertEquals(20, $po->received_quantity);

        // 6. Verify receiving history contains both receipts
        $this->assertCount(2, $po->receiving_history);
        $this->assertEquals(12, $po->receiving_history[0]['quantity']);
        $this->assertEquals(8, $po->receiving_history[1]['quantity']);

        // 7. Repeating the receipt on fully received PO must fail
        $dupRcv = $this->postJson("/api/purchases/{$poId}/receive", [
            'product_id' => $product->id,
            'quantity_received' => 1,
        ]);
        $dupRcv->assertStatus(422);
        $this->assertEquals(70, $product->fresh()->stock);
    }

    /**
     * Section 4: Sales -> Inventory -> Payment Test & Overselling Prevention
     */
    public function test_sales_lifecycle_inventory_deduction_and_receivables(): void
    {
        $product = Product::create([
            'code' => 'p-test-02',
            'name' => 'Dell Latitude 7440',
            'sku' => 'DELL-LAT-70',
            'category' => 'Computers',
            'price' => 120000,
            'cost' => 85000,
            'stock' => 70,
            'threshold' => 10,
            'warehouse' => 'Dhaka HQ Central Warehouse',
            'status' => 'in_stock',
        ]);

        $customer = Customer::create([
            'name' => 'Grameenphone Corporate',
            'email' => 'corp@grameenphone.com',
            'company' => 'Telecom',
            'spent' => 0,
        ]);

        // 1. Sell 5 units -> Stock becomes 65
        $saleRes = $this->postJson('/api/sales', [
            'customer_id' => $customer->id,
            'customer_name' => $customer->name,
            'payment_method' => 'Bank transfer',
            'status' => 'Paid',
            'items' => [
                [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'price' => $product->price,
                    'quantity' => 5,
                ]
            ],
        ]);
        $saleRes->assertStatus(201);
        $this->assertEquals(65, $product->fresh()->stock);

        // Verify invoice was created as Paid
        $saleId = $saleRes->json('id');
        $invoice = Invoice::where('sale_id', $saleId)->first();
        $this->assertNotNull($invoice);
        $this->assertEquals('Paid', $invoice->status);
        $this->assertEquals($saleRes->json('total'), $invoice->paid_amount);

        // 2. Unpaid Sale: must NOT increase paid cash, must create Unpaid invoice in Accounts Receivable
        $unpaidSale = $this->postJson('/api/sales', [
            'customer_id' => $customer->id,
            'customer_name' => $customer->name,
            'payment_method' => 'Bank transfer',
            'status' => 'Unpaid',
            'items' => [
                [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'price' => $product->price,
                    'quantity' => 2,
                ]
            ],
        ]);
        $unpaidSale->assertStatus(201);
        $this->assertEquals(63, $product->fresh()->stock);
        $unpaidInvoice = Invoice::where('sale_id', $unpaidSale->json('id'))->first();
        $this->assertNotNull($unpaidInvoice);
        $this->assertEquals('Unpaid', $unpaidInvoice->status);
        $this->assertEquals(0, $unpaidInvoice->paid_amount);

        // 3. Overselling Protection: Available stock 4, attempt to sell 5 must fail with 422
        $lowStockProduct = Product::create([
            'code' => 'p-test-03',
            'name' => 'Rare Server Unit',
            'sku' => 'RARE-SRV-4',
            'category' => 'Computers',
            'price' => 250000,
            'cost' => 190000,
            'stock' => 4,
            'threshold' => 2,
            'warehouse' => 'Dhaka HQ Central Warehouse',
        ]);

        $failSale = $this->postJson('/api/sales', [
            'customer_name' => 'Greedy Buyer Corp',
            'payment_method' => 'Cash',
            'status' => 'Paid',
            'items' => [
                [
                    'product_id' => $lowStockProduct->id,
                    'product_name' => $lowStockProduct->name,
                    'price' => $lowStockProduct->price,
                    'quantity' => 5,
                ]
            ],
        ]);
        $failSale->assertStatus(422);
        $this->assertEquals(4, $lowStockProduct->fresh()->stock, 'Stock must not change on failed oversale');
    }

    /**
     * Section 5: Sales Returns & Refunds
     */
    public function test_sales_return_lifecycle_and_restocking(): void
    {
        $product = Product::create([
            'code' => 'p-test-04',
            'name' => 'Ergonomic Chair',
            'sku' => 'CHAIR-RET-20',
            'category' => 'Office supplies',
            'price' => 18000,
            'cost' => 11000,
            'stock' => 20,
            'threshold' => 5,
            'warehouse' => 'Dhaka HQ Central Warehouse',
        ]);

        $customer = Customer::create([
            'name' => 'Tech Park Ltd.',
            'email' => 'admin@techpark.bd',
            'company' => 'IT Services',
            'spent' => 0,
        ]);

        // Sale of 3 units -> stock becomes 17
        $saleRes = $this->postJson('/api/sales', [
            'customer_id' => $customer->id,
            'customer_name' => $customer->name,
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
        $saleId = $saleRes->json('id');
        $this->assertEquals(17, $product->fresh()->stock);

        // Process Return with restock = true -> stock restored to 20
        $retRes = $this->postJson("/api/sales/{$saleId}/return", [
            'reason' => 'Customer requested color change',
            'restock' => true,
        ]);
        $retRes->assertStatus(200);
        $this->assertEquals(20, $product->fresh()->stock);
        $this->assertEquals('Returned', Sale::find($saleId)->status);

        // Repeating return on the same order must fail with 422
        $dupRet = $this->postJson("/api/sales/{$saleId}/return", [
            'reason' => 'Second attempt',
            'restock' => true,
        ]);
        $dupRet->assertStatus(422);
        $this->assertEquals(20, $product->fresh()->stock);
    }

    /**
     * Section 6: Multi-Warehouse Inventory Transfer Test
     * Dhaka: 50, Chittagong: 20 -> Transfer 10 from Dhaka to Chittagong -> Dhaka: 40, Chittagong: 30, Total: 70
     */
    public function test_multi_warehouse_inventory_transfer(): void
    {
        $dhakaProduct = Product::create([
            'code' => 'p-wh-01',
            'name' => 'Mesh Wi-Fi Node',
            'sku' => 'MESH-NODE-DHK',
            'category' => 'Networking',
            'price' => 8000,
            'cost' => 5000,
            'stock' => 50,
            'threshold' => 10,
            'warehouse' => 'Dhaka HQ Central Warehouse',
        ]);

        $ctgProduct = Product::create([
            'code' => 'p-wh-02',
            'name' => 'Mesh Wi-Fi Node',
            'sku' => 'MESH-NODE-CTG',
            'category' => 'Networking',
            'price' => 8000,
            'cost' => 5000,
            'stock' => 20,
            'threshold' => 10,
            'warehouse' => 'Chittagong Port Depot',
        ]);

        $initialTotal = $dhakaProduct->stock + $ctgProduct->stock;
        $this->assertEquals(70, $initialTotal);

        // Transfer 10 units from Dhaka to Chittagong
        $trfRes = $this->postJson('/api/inventory/transfer', [
            'product_id' => $dhakaProduct->id,
            'from_warehouse' => 'Dhaka HQ Central Warehouse',
            'to_warehouse' => 'Chittagong Port Depot',
            'quantity' => 10,
            'notes' => 'Port depot restocking',
        ]);
        $trfRes->assertStatus(200);

        $dhakaProduct->refresh();
        $ctgProduct->refresh();

        $this->assertEquals(40, $dhakaProduct->stock, 'Dhaka stock must decrease to 40');
        $this->assertEquals(30, $ctgProduct->stock, 'Chittagong stock must increase to 30');
        $this->assertEquals(70, $dhakaProduct->stock + $ctgProduct->stock, 'Total company stock must remain 70');

        // Transferring more than available (e.g. 50 from Dhaka when only 40 available) must fail
        $failTrf = $this->postJson('/api/inventory/transfer', [
            'product_id' => $dhakaProduct->id,
            'from_warehouse' => 'Dhaka HQ Central Warehouse',
            'to_warehouse' => 'Chittagong Port Depot',
            'quantity' => 50,
        ]);
        $failTrf->assertStatus(422);
        $this->assertEquals(40, $dhakaProduct->fresh()->stock);
    }

    /**
     * Section 7: Professional Stock Adjustment Test
     */
    public function test_professional_stock_adjustment(): void
    {
        $product = Product::create([
            'code' => 'p-adj-01',
            'name' => '4K USB-C Web Camera',
            'sku' => 'CAM-4K-PRO',
            'category' => 'Electronics',
            'price' => 14000,
            'cost' => 9000,
            'stock' => 40,
            'threshold' => 5,
            'warehouse' => 'Dhaka HQ Central Warehouse',
        ]);

        // 1. Damage Adjustment: -3 units -> stock becomes 37
        $adj1 = $this->postJson('/api/inventory/adjust', [
            'product_id' => $product->id,
            'adjustment_type' => 'Damage',
            'quantity' => -3,
            'reason' => 'Water damage during warehouse roof maintenance',
            'warehouse' => $product->warehouse,
        ]);
        $adj1->assertStatus(200);
        $this->assertEquals(37, $product->fresh()->stock);

        // Verify Audit Log created
        $audit1 = AuditLog::where('record_reference', 'like', 'ADJ-%')->latest('id')->first();
        $this->assertNotNull($audit1);
        $this->assertStringContainsString('Stock Adjusted (Damage)', $audit1->action);

        // 2. Audit Reconciliation: +5 units -> stock becomes 42
        $adj2 = $this->postJson('/api/inventory/adjust', [
            'product_id' => $product->id,
            'adjustment_type' => 'Audit Reconciliation',
            'quantity' => 5,
            'reason' => 'Unpacked sealed carton found during monthly physical audit',
            'warehouse' => $product->warehouse,
        ]);
        $adj2->assertStatus(200);
        $this->assertEquals(42, $product->fresh()->stock);

        // 3. Invalid adjustment causing negative stock must fail
        $adjFail = $this->postJson('/api/inventory/adjust', [
            'product_id' => $product->id,
            'adjustment_type' => 'Lost',
            'quantity' => -100,
            'reason' => 'Discrepancy too large',
        ]);
        $adjFail->assertStatus(422);
        $this->assertEquals(42, $product->fresh()->stock);
    }

    /**
     * Section 8: Finance & Accounting Genuine Calculations
     */
    public function test_finance_accounting_genuine_calculations(): void
    {
        $statsRes = $this->getJson('/api/dashboard/stats');
        $statsRes->assertStatus(200);

        $kpis = collect($statsRes->json('kpis'))->keyBy('id');

        $this->assertTrue($kpis->has('rev'));
        $this->assertTrue($kpis->has('orders'));
        $this->assertTrue($kpis->has('inv'));
        $this->assertTrue($kpis->has('profit'));
        $this->assertTrue($kpis->has('expenses'));
        $this->assertTrue($kpis->has('receivables'));

        // Expenses must NOT be hardcoded 45,72,000, must match actual employee salary
        $expectedSalaryExpense = Employee::where('status', 'Active')->sum('salary');
        $this->assertEquals($expectedSalaryExpense, $kpis['expenses']['raw_value']);
    }

    /**
     * Section 9: 5-Role RBAC & Security Test
     */
    public function test_5_primary_roles_authentication_and_sanctum_tokens(): void
    {
        $roles = [
            'shakib@nserp.com' => 'Company Admin',
            'manager@nserp.com' => 'Manager',
            'accountant@nserp.com' => 'Accountant',
            'staff@nserp.com' => 'Staff',
            'employee@nserp.com' => 'Employee',
        ];

        foreach ($roles as $email => $role) {
            $res = $this->postJson('/api/login', [
                'email' => $email,
                'password' => 'password',
            ]);

            $res->assertStatus(200);
            $this->assertEquals($role, $res->json('user.role'));
            $this->assertNotEmpty($res->json('token'));
            $this->assertNotNull($res->json('user.allowed_modules'));
        }
    }
}
