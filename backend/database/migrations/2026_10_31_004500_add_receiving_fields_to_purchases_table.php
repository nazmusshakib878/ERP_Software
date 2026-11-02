<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            if (!Schema::hasColumn('purchases', 'received_quantity')) {
                $table->integer('received_quantity')->default(0)->after('items_count');
            }
            if (!Schema::hasColumn('purchases', 'receiving_history')) {
                $table->json('receiving_history')->nullable()->after('notes');
            }
        });
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn(['received_quantity', 'receiving_history']);
        });
    }
};

