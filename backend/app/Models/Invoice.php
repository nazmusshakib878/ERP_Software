<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'sale_id',
        'customer_name',
        'date',
        'due_date',
        'total_amount',
        'paid_amount',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'due_date' => 'date',
        'total_amount' => 'float',
        'paid_amount' => 'float',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
}

