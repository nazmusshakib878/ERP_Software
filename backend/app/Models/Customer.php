<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'email',
        'phone',
        'company',
        'company_type',
        'spent',
        'status',
        'tier',
        'avatar',
        'address',
    ];

    protected $casts = [
        'spent' => 'float',
    ];

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}

