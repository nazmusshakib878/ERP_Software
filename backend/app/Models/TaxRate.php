<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'rate',
        'type',
        'is_default',
        'status',
    ];

    protected $casts = [
        'rate' => 'float',
        'is_default' => 'boolean',
    ];
}

