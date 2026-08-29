<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PharmacySupplier extends Model
{
    use HasFactory;

    protected $table = 'pharmacy_suppliers';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'contact_person',
        'phone',
        'mobile',
        'email',
        'address',
        'city',
        'ntn_number',
        'strn_number',
        'drug_license_no',
        'opening_balance',
        'current_balance',
        'is_active',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (PharmacySupplier $model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }
}
