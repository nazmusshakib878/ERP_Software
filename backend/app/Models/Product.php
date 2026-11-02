<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'sku',
        'category',
        'price',
        'cost',
        'stock',
        'reserved',
        'threshold',
        'warehouse',
        'image',
        'rating',
        'status',
        'description',
    ];

    protected $casts = [
        'price' => 'float',
        'cost' => 'float',
        'stock' => 'integer',
        'reserved' => 'integer',
        'threshold' => 'integer',
        'rating' => 'float',
    ];

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }
}

