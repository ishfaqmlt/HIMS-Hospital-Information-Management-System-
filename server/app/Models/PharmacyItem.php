<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PharmacyItem extends Model
{
    protected $table = 'pharmacy_items';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'ItemCode',
        'ItemName',
        'Category',
        'Manufacturer',
        'Unit',
        'PurchasePrice',
        'SellingPrice',
        'StockQuantity',
        'ReorderLevel',
        'ExpiryDate',
        'BatchNo',
        'isActive',
        'CreatedBy',
        'isSynced',
    ];

    protected $casts = [
        'PurchasePrice' => 'decimal:2',
        'SellingPrice' => 'decimal:2',
        'StockQuantity' => 'integer',
        'ReorderLevel' => 'integer',
        'ExpiryDate' => 'date',
        'isActive' => 'boolean',
        'CreatedBy' => 'integer',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (PharmacyItem $model) {
            if (empty($model->Id)) {
                $model->Id = Str::uuid();
            }
        });
    }
}
