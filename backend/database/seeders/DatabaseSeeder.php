<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\Invoice;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Role;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Setting;
use App\Models\TaxRate;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Prevent duplicate seed failure on repeated deployment runs
        if (User::where('email', 'shakib@nserp.com')->exists()) {
            return;
        }

        // 1. Users for All Enterprise Roles (Password: password)
        $users = [
            [
                'name' => 'Md. Nazmus Shakib',
                'email' => 'shakib@nserp.com',
                'password' => Hash::make('password'),
                'role' => 'Company Admin',
                'initials' => 'NS',
                'avatar' => '/user-avatar.jpg',
                'workspace' => 'NS ERP / Aster Trading Ltd.',
                'allowed_modules' => ['Dashboard', 'Sales', 'Inventory', 'Products', 'Purchases', 'Customers', 'Employees', 'Finance', 'Analytics', 'Settings'],
                'permissions' => ['all'],
            ],
            [
                'name' => 'Arif Rahman',
                'email' => 'manager@nserp.com',
                'password' => Hash::make('password'),
                'role' => 'Manager',
                'initials' => 'AR',
                'avatar' => null,
                'workspace' => 'NS ERP / Aster Trading Ltd.',
                'allowed_modules' => ['Dashboard', 'Sales', 'Inventory', 'Products', 'Purchases', 'Customers', 'Employees', 'Finance', 'Analytics', 'Settings'],
                'permissions' => ['sales.*', 'inventory.*', 'products.*', 'purchases.*', 'customers.*', 'employees.view', 'finance.view', 'analytics.view'],
            ],
            [
                'name' => 'Kamrul Hasan',
                'email' => 'accountant@nserp.com',
                'password' => Hash::make('password'),
                'role' => 'Accountant',
                'initials' => 'KH',
                'avatar' => null,
                'workspace' => 'NS ERP / Aster Trading Ltd.',
                'allowed_modules' => ['Dashboard', 'Sales', 'Customers', 'Finance', 'Analytics'],
                'permissions' => ['finance.*', 'invoices.*', 'sales.view', 'customers.view', 'analytics.view'],
            ],
            [
                'name' => 'Tanvir Ahmed',
                'email' => 'staff@nserp.com',
                'password' => Hash::make('password'),
                'role' => 'Staff',
                'initials' => 'TA',
                'avatar' => null,
                'workspace' => 'NS ERP / Aster Trading Ltd.',
                'allowed_modules' => ['Dashboard', 'Sales', 'Inventory', 'Products', 'Purchases'],
                'permissions' => ['sales.view', 'sales.create', 'sales.edit', 'inventory.view', 'inventory.adjust', 'inventory.transfer', 'products.view', 'purchases.view', 'purchases.receive_goods'],
            ],
            [
                'name' => 'Rahim Uddin',
                'email' => 'employee@nserp.com',
                'password' => Hash::make('password'),
                'role' => 'Employee',
                'initials' => 'RU',
                'avatar' => null,
                'workspace' => 'NS ERP / Aster Trading Ltd.',
                'allowed_modules' => ['Dashboard', 'Employees'],
                'permissions' => ['dashboard.view', 'employees.self'],
            ],
            [
                'name' => 'Sales Staff (Migrated)',
                'email' => 'sales@nserp.com',
                'password' => Hash::make('password'),
                'role' => 'Staff',
                'initials' => 'SS',
                'avatar' => null,
                'workspace' => 'NS ERP / Aster Trading Ltd.',
                'allowed_modules' => ['Dashboard', 'Sales', 'Customers'],
                'permissions' => ['sales.view', 'sales.create', 'sales.edit', 'customers.view', 'customers.create'],
            ],
            [
                'name' => 'Inventory Staff (Migrated)',
                'email' => 'inventory@nserp.com',
                'password' => Hash::make('password'),
                'role' => 'Staff',
                'initials' => 'IS',
                'avatar' => null,
                'workspace' => 'NS ERP / Aster Trading Ltd.',
                'allowed_modules' => ['Dashboard', 'Inventory', 'Products'],
                'permissions' => ['inventory.view', 'inventory.adjust', 'inventory.transfer', 'products.view'],
            ],
            [
                'name' => 'Alex Morgan',
                'email' => 'alex@nserp.com',
                'password' => Hash::make('password'),
                'role' => 'Super Admin',
                'initials' => 'AM',
                'avatar' => '/user-avatar.jpg',
                'workspace' => 'NS Enterprise',
                'allowed_modules' => ['Dashboard', 'Sales', 'Inventory', 'Products', 'Purchases', 'Customers', 'Employees', 'Finance', 'Analytics', 'Settings'],
                'permissions' => ['all'],
            ],
        ];

        foreach ($users as $u) {
            User::create($u);
        }

        // 2. Products
        $products = [
            [
                'code' => 'p-001', 'name' => 'Logitech MX Master 3S', 'sku' => 'NXR-3001', 'category' => 'Electronics',
                'price' => 12500, 'cost' => 8200, 'stock' => 18, 'reserved' => 2, 'threshold' => 15, 'warehouse' => 'Dhaka HQ',
                'image' => '/assets/product-graphite-logitech-mx-master-3s-wireless-ergonomic-mouse.jpg', 'rating' => 4.8, 'status' => 'in_stock',
                'description' => 'Precision wireless ergonomic mouse with fast scrolling and quiet clicks.'
            ],
            [
                'code' => 'p-002', 'name' => 'Samsung T7 SSD 1TB', 'sku' => 'NXR-3002', 'category' => 'Storage',
                'price' => 9500, 'cost' => 6400, 'stock' => 9, 'reserved' => 0, 'threshold' => 12, 'warehouse' => 'Dhaka HQ',
                'image' => '/assets/product-samsung-t7-slim-blue-portable-ssd.jpg', 'rating' => 4.6, 'status' => 'low_stock',
                'description' => 'Ultra fast portable NVMe SSD with USB 3.2 Gen 2 connectivity.'
            ],
            [
                'code' => 'p-003', 'name' => 'Keychron K2 Pro', 'sku' => 'NXR-3003', 'category' => 'Electronics',
                'price' => 11000, 'cost' => 7400, 'stock' => 5, 'reserved' => 0, 'threshold' => 12, 'warehouse' => 'Chittagong',
                'image' => '/assets/product-keychron-k2-mechanical-keyboard-with-graphite-keycaps.jpg', 'rating' => 4.7, 'status' => 'low_stock',
                'description' => 'Customizable wireless mechanical keyboard with QMK/VIA support.'
            ],
            [
                'code' => 'p-004', 'name' => 'Dell P2425H Monitor', 'sku' => 'NXR-3004', 'category' => 'Computers',
                'price' => 18500, 'cost' => 13000, 'stock' => 4, 'reserved' => 0, 'threshold' => 10, 'warehouse' => 'Dhaka HQ',
                'image' => '/assets/product-dell-p2425h-slim-black-desktop-monitor.jpg', 'rating' => 4.5, 'status' => 'low_stock',
                'description' => '24-inch FHD IPS display with ultrathin bezels and adjustable height.'
            ],
            [
                'code' => 'p-005', 'name' => 'Anker 65W Charger', 'sku' => 'NXR-3005', 'category' => 'Accessories',
                'price' => 4500, 'cost' => 2900, 'stock' => 72, 'reserved' => 4, 'threshold' => 20, 'warehouse' => 'Sylhet',
                'image' => '/assets/product-anker-compact-white-usb-c-wall-charger.jpg', 'rating' => 4.3, 'status' => 'in_stock',
                'description' => 'Compact GaN fast wall charger with dual USB-C ports.'
            ],
            [
                'code' => 'p-006', 'name' => 'TP-Link Archer AX23', 'sku' => 'NXR-3006', 'category' => 'Networking',
                'price' => 7500, 'cost' => 4800, 'stock' => 31, 'reserved' => 1, 'threshold' => 10, 'warehouse' => 'Dhaka HQ',
                'image' => '/assets/product-tp-link-black-wireless-router-with-four-antennas.jpg', 'rating' => 4.2, 'status' => 'in_stock',
                'description' => 'Dual-band Wi-Fi 6 router delivering high-speed internet connectivity.'
            ],
            [
                'code' => 'p-007', 'name' => 'Jabra Evolve Headset', 'sku' => 'NXR-3007', 'category' => 'Audio',
                'price' => 8900, 'cost' => 5600, 'stock' => 14, 'reserved' => 0, 'threshold' => 12, 'warehouse' => 'Chittagong',
                'image' => '/assets/product-jabra-evolve-black-wired-office-headset.jpg', 'rating' => 4.1, 'status' => 'in_stock',
                'description' => 'Professional wired enterprise headset with active noise cancellation.'
            ],
            [
                'code' => 'p-008', 'name' => 'A4 Paper Ream', 'sku' => 'NXR-3008', 'category' => 'Office supplies',
                'price' => 650, 'cost' => 420, 'stock' => 156, 'reserved' => 6, 'threshold' => 24, 'warehouse' => 'Dhaka HQ',
                'image' => '/assets/product-ream-of-white-a4-paper-in-blue-packaging.jpg', 'rating' => 4.0, 'status' => 'in_stock',
                'description' => 'High quality 80gsm multipurpose copy and printing paper.'
            ],
        ];

        $createdProducts = [];
        foreach ($products as $p) {
            $createdProducts[$p['code']] = Product::create($p);
        }

        // 3. Customers
        $customers = [
            ['code' => 'c-001', 'name' => 'Northstar Retail', 'email' => 'accounts@northstar.com', 'company' => 'Retail', 'company_type' => 'Retail Chain', 'phone' => '+880 181 112 2334', 'spent' => 1104000, 'status' => 'active', 'avatar' => 'northstar', 'tier' => 'Enterprise'],
            ['code' => 'c-002', 'name' => 'Meghna Enterprise', 'email' => 'payroll@meghna.ltd', 'company' => 'Distribution', 'company_type' => 'Logistics & Wholesale', 'phone' => '+880 182 223 3445', 'spent' => 332000, 'status' => 'active', 'avatar' => 'meghna', 'tier' => 'Business'],
            ['code' => 'c-003', 'name' => 'Dhaka Digital Ltd.', 'email' => 'ops@dhakadigital.com', 'company' => 'Technology', 'company_type' => 'Software & IT', 'phone' => '+880 183 334 4556', 'spent' => 990000, 'status' => 'active', 'avatar' => 'dhakai', 'tier' => 'Enterprise'],
            ['code' => 'c-004', 'name' => 'Vertex Solutions', 'email' => 'billing@vertex.io', 'company' => 'SaaS', 'company_type' => 'Cloud Services', 'phone' => '+880 184 445 5667', 'spent' => 706000, 'status' => 'active', 'avatar' => 'vertex', 'tier' => 'Business'],
            ['code' => 'c-005', 'name' => 'Bengal Office Co.', 'email' => 'hello@bengaloffice.com', 'company' => 'Corporate', 'company_type' => 'Corporate Supplies', 'phone' => '+880 185 556 6778', 'spent' => 563000, 'status' => 'active', 'avatar' => 'bengal', 'tier' => 'Business'],
            ['code' => 'c-006', 'name' => 'Orion Technologies', 'email' => 'finance@orion.tech', 'company' => 'Technology', 'company_type' => 'System Integrator', 'phone' => '+880 186 667 7889', 'spent' => 412000, 'status' => 'inactive', 'avatar' => 'orion', 'tier' => 'Standard'],
        ];

        $createdCustomers = [];
        foreach ($customers as $c) {
            $createdCustomers[$c['name']] = Customer::create($c);
        }

        // 4. Employees
        $employees = [
            ['code' => 'e-001', 'name' => 'Arif Rahman', 'role' => 'Sales Manager', 'department' => 'Sales', 'email' => 'arif@apexerp.com', 'phone' => '+880 171 234 5678', 'hire_date' => '2021-03-12', 'status' => 'Active', 'avatar' => 'arif', 'salary' => 85000],
            ['code' => 'e-002', 'name' => 'Farhana Islam', 'role' => 'Stock Controller', 'department' => 'Inventory', 'email' => 'farhana@apexerp.com', 'phone' => '+880 172 345 6789', 'hire_date' => '2020-11-08', 'status' => 'Active', 'avatar' => 'farhana', 'salary' => 65000],
            ['code' => 'e-003', 'name' => 'Sajid Hossain', 'role' => 'Finance Officer', 'department' => 'Finance', 'email' => 'sajid@apexerp.com', 'phone' => '+880 173 456 7890', 'hire_date' => '2019-07-22', 'status' => 'Active', 'avatar' => 'sajid', 'salary' => 70000],
            ['code' => 'e-004', 'name' => 'Meherun Nisa', 'role' => 'HR Officer', 'department' => 'HR', 'email' => 'meherun@apexerp.com', 'phone' => '+880 174 567 8901', 'hire_date' => '2022-01-15', 'status' => 'Active', 'avatar' => 'meherun', 'salary' => 60000],
            ['code' => 'e-005', 'name' => 'Rafiq Uddin', 'role' => 'Sales Representative', 'department' => 'Sales', 'email' => 'rafiq@apexerp.com', 'phone' => '+880 175 678 9012', 'hire_date' => '2023-05-30', 'status' => 'On leave', 'avatar' => 'rafiq', 'salary' => 45000],
            ['code' => 'e-006', 'name' => 'Nusrat Ahmed', 'role' => 'Sales Representative', 'department' => 'Sales', 'email' => 'nusrat@apexerp.com', 'phone' => '+880 176 789 0123', 'hire_date' => '2022-09-14', 'status' => 'Active', 'avatar' => 'nusrat', 'salary' => 48000],
            ['code' => 'e-007', 'name' => 'Tanvir Hasan', 'role' => 'Sales Representative', 'department' => 'Sales', 'email' => 'tanvir@apexerp.com', 'phone' => '+880 177 890 1234', 'hire_date' => '2023-02-19', 'status' => 'Active', 'avatar' => 'tanvir', 'salary' => 46000],
        ];

        foreach ($employees as $e) {
            Employee::create($e);
        }

        // 5. Sales & Orders
        $salesData = [
            [
                'order_number' => 'SAL-2026-1048', 'date' => '2026-10-29', 'customer_name' => 'Bengal Office Co.',
                'customer_email' => 'hello@bengaloffice.com', 'rep_name' => 'Nusrat Ahmed', 'rep_avatar' => 'nusrat',
                'subtotal' => 125750, 'tax' => 23875, 'discount' => 0, 'total' => 149625, 'payment_method' => 'Bank transfer', 'status' => 'Unpaid',
                'items' => [
                    ['product_code' => 'p-001', 'quantity' => 5, 'price' => 12500],
                    ['product_code' => 'p-004', 'quantity' => 3, 'price' => 18500],
                    ['product_code' => 'p-005', 'quantity' => 2, 'price' => 4500],
                ]
            ],
            [
                'order_number' => 'SAL-2026-1047', 'date' => '2026-10-28', 'customer_name' => 'Vertex Solutions',
                'customer_email' => 'billing@vertex.io', 'rep_name' => 'Tanvir Hasan', 'rep_avatar' => 'tanvir',
                'subtotal' => 74400, 'tax' => 12000, 'discount' => 0, 'total' => 86400, 'payment_method' => 'bKash', 'status' => 'Paid',
                'items' => [
                    ['product_code' => 'p-003', 'quantity' => 4, 'price' => 11000],
                    ['product_code' => 'p-002', 'quantity' => 3, 'price' => 9500],
                ]
            ],
            [
                'order_number' => 'SAL-2026-1046', 'date' => '2026-10-28', 'customer_name' => 'Dhaka Digital Ltd.',
                'customer_email' => 'ops@dhakadigital.com', 'rep_name' => 'Arif Rahman', 'rep_avatar' => 'arif',
                'subtotal' => 180900, 'tax' => 31200, 'discount' => 0, 'total' => 212100, 'payment_method' => 'Bank transfer', 'status' => 'Partial',
                'items' => [
                    ['product_code' => 'p-004', 'quantity' => 6, 'price' => 18500],
                    ['product_code' => 'p-001', 'quantity' => 4, 'price' => 12500],
                    ['product_code' => 'p-006', 'quantity' => 3, 'price' => 7500],
                ]
            ],
            [
                'order_number' => 'SAL-2026-1045', 'date' => '2026-10-27', 'customer_name' => 'Meghna Enterprise',
                'customer_email' => 'payroll@meghna.ltd', 'rep_name' => 'Arif Rahman', 'rep_avatar' => 'arif',
                'subtotal' => 41500, 'tax' => 7250, 'discount' => 0, 'total' => 48750, 'payment_method' => 'Cash', 'status' => 'Paid',
                'items' => [
                    ['product_code' => 'p-005', 'quantity' => 5, 'price' => 4500],
                    ['product_code' => 'p-007', 'quantity' => 2, 'price' => 8900],
                ]
            ],
            [
                'order_number' => 'SAL-2026-1044', 'date' => '2026-10-27', 'customer_name' => 'Northstar Retail',
                'customer_email' => 'accounts@northstar.com', 'rep_name' => 'Tanvir Hasan', 'rep_avatar' => 'tanvir',
                'subtotal' => 55600, 'tax' => 9200, 'discount' => 0, 'total' => 64800, 'payment_method' => 'Bank transfer', 'status' => 'Paid',
                'items' => [
                    ['product_code' => 'p-002', 'quantity' => 4, 'price' => 9500],
                    ['product_code' => 'p-003', 'quantity' => 2, 'price' => 11000],
                ]
            ],
            [
                'order_number' => 'SAL-2026-1043', 'date' => '2026-10-26', 'customer_name' => 'Orion Technologies',
                'customer_email' => 'finance@orion.tech', 'rep_name' => 'Nusrat Ahmed', 'rep_avatar' => 'nusrat',
                'subtotal' => 63500, 'tax' => 11000, 'discount' => 0, 'total' => 74500, 'payment_method' => 'Card', 'status' => 'Paid',
                'items' => [
                    ['product_code' => 'p-001', 'quantity' => 3, 'price' => 12500],
                    ['product_code' => 'p-006', 'quantity' => 2, 'price' => 7500],
                    ['product_code' => 'p-005', 'quantity' => 2, 'price' => 4500],
                ]
            ],
            [
                'order_number' => 'SAL-2026-1042', 'date' => '2026-10-25', 'customer_name' => 'Vertex Solutions',
                'customer_email' => 'billing@vertex.io', 'rep_name' => 'Arif Rahman', 'rep_avatar' => 'arif',
                'subtotal' => 27700, 'tax' => 4500, 'discount' => 0, 'total' => 32200, 'payment_method' => 'bKash', 'status' => 'Overdue',
                'items' => [
                    ['product_code' => 'p-007', 'quantity' => 2, 'price' => 8900],
                    ['product_code' => 'p-005', 'quantity' => 2, 'price' => 4500],
                ]
            ],
            [
                'order_number' => 'SAL-2026-1041', 'date' => '2026-10-25', 'customer_name' => 'Northstar Retail',
                'customer_email' => 'accounts@northstar.com', 'rep_name' => 'Tanvir Hasan', 'rep_avatar' => 'tanvir',
                'subtotal' => 100000, 'tax' => 18500, 'discount' => 0, 'total' => 118500, 'payment_method' => 'Bank transfer', 'status' => 'Paid',
                'items' => [
                    ['product_code' => 'p-004', 'quantity' => 4, 'price' => 18500],
                    ['product_code' => 'p-003', 'quantity' => 2, 'price' => 11000],
                ]
            ],
        ];

        foreach ($salesData as $sd) {
            $items = $sd['items'];
            unset($sd['items']);

            $customer = $createdCustomers[$sd['customer_name']] ?? null;
            if ($customer) {
                $sd['customer_id'] = $customer->id;
            }

            $sale = Sale::create($sd);

            foreach ($items as $item) {
                $prod = $createdProducts[$item['product_code']] ?? null;
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $prod ? $prod->id : null,
                    'product_name' => $prod ? $prod->name : 'ERP Item',
                    'sku' => $prod ? $prod->sku : 'SKU-000',
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['price'] * $item['quantity'],
                ]);
            }
        }

        // 6. Purchases
        $purchases = [
            ['po_number' => 'PO-2026-0286', 'date' => '2026-10-22', 'supplier_name' => 'Global Tech Distributors', 'items_count' => 48, 'total_amount' => 40000, 'status' => 'Received', 'rep_name' => 'Arif Rahman'],
            ['po_number' => 'PO-2026-0285', 'date' => '2026-10-18', 'supplier_name' => 'Anwar & Brothers', 'items_count' => 36, 'total_amount' => 32400, 'status' => 'Pending', 'rep_name' => 'Farhana Islam'],
            ['po_number' => 'PO-2026-0284', 'date' => '2026-10-10', 'supplier_name' => 'Metro Electronics', 'items_count' => 24, 'total_amount' => 58800, 'status' => 'Partially received', 'rep_name' => 'Arif Rahman'],
            ['po_number' => 'PO-2026-0283', 'date' => '2026-10-05', 'supplier_name' => 'Greenfield Supplies', 'items_count' => 120, 'total_amount' => 19500, 'status' => 'Received', 'rep_name' => 'Rafiq Uddin'],
        ];

        foreach ($purchases as $po) {
            Purchase::create($po);
        }

        // 7. Invoices
        $invoices = [
            ['invoice_number' => 'INV-2026-1048', 'customer_name' => 'Bengal Office Co.', 'date' => '2026-10-29', 'due_date' => '2026-11-29', 'total_amount' => 149625, 'paid_amount' => 0, 'status' => 'Unpaid'],
            ['invoice_number' => 'INV-2026-1046', 'customer_name' => 'Dhaka Digital Ltd.', 'date' => '2026-10-28', 'due_date' => '2026-11-28', 'total_amount' => 212100, 'paid_amount' => 120000, 'status' => 'Partially paid'],
            ['invoice_number' => 'INV-2026-1044', 'customer_name' => 'Northstar Retail', 'date' => '2026-10-27', 'due_date' => '2026-11-27', 'total_amount' => 64800, 'paid_amount' => 64800, 'status' => 'Paid'],
            ['invoice_number' => 'INV-2026-1041', 'customer_name' => 'Northstar Retail', 'date' => '2026-10-25', 'due_date' => '2026-11-25', 'total_amount' => 118500, 'paid_amount' => 118500, 'status' => 'Paid'],
            ['invoice_number' => 'INV-2026-1042', 'customer_name' => 'Vertex Solutions', 'date' => '2026-10-26', 'due_date' => '2026-11-26', 'total_amount' => 32200, 'paid_amount' => 0, 'status' => 'Overdue'],
        ];

        foreach ($invoices as $inv) {
            Invoice::create($inv);
        }

        // 8. Activities
        $activities = [
            ['message' => 'Payment received from Bengal Office Co.', 'actor' => 'Arif Rahman', 'type' => 'payment'],
            ['message' => 'October payroll approved', 'actor' => 'Farhana Islam', 'type' => 'hr'],
            ['message' => 'Stock received at Dhaka Central', 'actor' => 'Rafiq Uddin', 'type' => 'inventory'],
            ['message' => 'Nusrat created sale SAL-2026-1048', 'actor' => 'Nusrat Ahmed', 'type' => 'sale'],
        ];

        foreach ($activities as $act) {
            Activity::create($act);
        }

        // 9. Settings
        $settings = [
            'workspace_name' => 'NS Enterprise',
            'company_name' => 'Aster Trading Ltd.',
            'timezone' => 'UTC+06:00 · Dhaka',
            'currency' => 'BDT',
            'currency_symbol' => '৳',
            'dark_mode' => 'false',
        ];

        foreach ($settings as $k => $v) {
            Setting::create(['key' => $k, 'value' => $v]);
        }

        // 10. Warehouses
        $warehouses = [
            ['name' => 'Dhaka HQ Central Warehouse', 'code' => 'WH-DHK-01', 'location' => 'Tejgaon Industrial Area, Dhaka', 'city' => 'Dhaka', 'capacity' => 25000, 'manager_name' => 'Farhana Islam', 'status' => 'Active'],
            ['name' => 'Chittagong Port Depot', 'code' => 'WH-CTG-02', 'location' => 'Agrabad C/A, Chittagong', 'city' => 'Chittagong', 'capacity' => 18000, 'manager_name' => 'Tanvir Hasan', 'status' => 'Active'],
            ['name' => 'Sylhet Regional Hub', 'code' => 'WH-SYL-03', 'location' => 'Subidbazar, Sylhet', 'city' => 'Sylhet', 'capacity' => 10000, 'manager_name' => 'Rafiq Uddin', 'status' => 'Active'],
        ];
        foreach ($warehouses as $wh) {
            Warehouse::create($wh);
        }

        // 11. Tax Rates
        $taxRates = [
            ['name' => 'Standard VAT (15%)', 'rate' => 15.00, 'type' => 'percentage', 'is_default' => true, 'status' => 'Active'],
            ['name' => 'Reduced Rate (5%)', 'rate' => 5.00, 'type' => 'percentage', 'is_default' => false, 'status' => 'Active'],
            ['name' => 'Zero Rated (0%)', 'rate' => 0.00, 'type' => 'percentage', 'is_default' => false, 'status' => 'Active'],
        ];
        foreach ($taxRates as $tr) {
            TaxRate::create($tr);
        }

        // 12. Roles (5 Primary Company Roles + Super Admin)
        $roles = [
            ['name' => 'Super Admin', 'slug' => 'super_admin', 'description' => 'Platform wide SaaS administration & multi-tenant management (System)', 'hierarchy_level' => 10],
            ['name' => 'Company Admin', 'slug' => 'company_admin', 'description' => 'Full administrative access across all business modules & configurations', 'hierarchy_level' => 9],
            ['name' => 'Manager', 'slug' => 'manager', 'description' => 'Operations management, approval workflows & module supervision', 'hierarchy_level' => 7],
            ['name' => 'Accountant', 'slug' => 'accountant', 'description' => 'Financial accounting, invoices, accounts receivable/payable & ledger', 'hierarchy_level' => 6],
            ['name' => 'Staff', 'slug' => 'staff', 'description' => 'Configurable operational staff with assigned module permissions', 'hierarchy_level' => 4],
            ['name' => 'Employee', 'slug' => 'employee', 'description' => 'Self-service portal: personal profile, attendance, leave requests & payslips', 'hierarchy_level' => 2],
        ];
        foreach ($roles as $r) {
            Role::create($r);
        }

        // 13. Core Permissions
        $permissionsList = [
            ['name' => 'View Executive Dashboard', 'slug' => 'dashboard.view', 'module' => 'dashboard', 'action' => 'view'],
            ['name' => 'View Financial KPIs', 'slug' => 'dashboard.financials', 'module' => 'dashboard', 'action' => 'view'],
            ['name' => 'Manage Sales Orders', 'slug' => 'sales.manage', 'module' => 'sales', 'action' => 'manage'],
            ['name' => 'Create Quotations', 'slug' => 'sales.quotes', 'module' => 'sales', 'action' => 'create'],
            ['name' => 'Process Sales Returns', 'slug' => 'sales.returns', 'module' => 'sales', 'action' => 'approve'],
            ['name' => 'Manage Stock Adjustments', 'slug' => 'inventory.adjust', 'module' => 'inventory', 'action' => 'adjust_stock'],
            ['name' => 'Transfer Stock Between Warehouses', 'slug' => 'inventory.transfer', 'module' => 'inventory', 'action' => 'transfer'],
            ['name' => 'Manage Product Catalog', 'slug' => 'products.manage', 'module' => 'products', 'action' => 'manage'],
            ['name' => 'Create Purchase Orders', 'slug' => 'purchases.create', 'module' => 'purchases', 'action' => 'create'],
            ['name' => 'Receive Goods & Post Stock', 'slug' => 'purchases.receive_goods', 'module' => 'purchases', 'action' => 'receive_goods'],
            ['name' => 'Manage Customers', 'slug' => 'customers.manage', 'module' => 'customers', 'action' => 'manage'],
            ['name' => 'Manage Payroll & Compensation', 'slug' => 'employees.payroll', 'module' => 'employees', 'action' => 'manage'],
            ['name' => 'Approve Employee Leave', 'slug' => 'employees.leave_approval', 'module' => 'employees', 'action' => 'approve'],
            ['name' => 'Record Financial Transactions', 'slug' => 'finance.record_payment', 'module' => 'finance', 'action' => 'record'],
            ['name' => 'View General Ledger & P&L', 'slug' => 'finance.reports', 'module' => 'finance', 'action' => 'view'],
            ['name' => 'Export Business Analytics', 'slug' => 'analytics.export', 'module' => 'analytics', 'action' => 'export'],
            ['name' => 'System Administration & Security', 'slug' => 'settings.admin', 'module' => 'settings', 'action' => 'admin'],
        ];
        foreach ($permissionsList as $p) {
            Permission::create($p);
        }

        // 14. Initial Immutable Audit Trail
        $auditLogs = [
            [
                'user_name' => 'Md. Nazmus Shakib',
                'action' => 'System Initialized',
                'module' => 'System',
                'record_reference' => 'SYS-INIT',
                'details' => 'NS ERP Enterprise core platform initialized with SQLite storage and Sanctum token auth.',
                'ip_address' => '127.0.0.1',
            ],
            [
                'user_name' => 'Md. Nazmus Shakib',
                'action' => 'Company Profile Configured',
                'module' => 'Settings',
                'record_reference' => 'SETT-001',
                'details' => 'Workspace configured for Aster Trading Ltd. (Dhaka HQ, Currency: BDT, Standard VAT: 15%).',
                'ip_address' => '127.0.0.1',
            ],
            [
                'user_name' => 'System Automated Daemon',
                'action' => 'Warehouses Provisioned',
                'module' => 'Inventory',
                'record_reference' => 'WH-SETUP',
                'details' => 'Three central regional warehouses provisioned (Dhaka HQ, Chittagong Port, Sylhet Hub).',
                'ip_address' => '127.0.0.1',
            ],
        ];
        foreach ($auditLogs as $log) {
            AuditLog::create($log);
        }
    }
}
