<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'po_number',
        'supplier_name',
        'supplier_email',
        'items_count',
        'received_quantity',
        'total_amount',
        'status',
        'rep_name',
        'date',
        'expected_date',
        'notes',
        'receiving_history',
    ];

    protected $casts = [
        'items_count' => 'integer',
        'received_quantity' => 'integer',
        'total_amount' => 'float',
        'date' => 'date',
        'expected_date' => 'date',
        'receiving_history' => 'array',
    ];
}

