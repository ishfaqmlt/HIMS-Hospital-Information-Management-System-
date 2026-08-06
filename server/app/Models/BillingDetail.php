<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BillingDetail extends Model
{
    protected $table = 'billing_details';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'BillingId',
        'serviceId',
        'Qty',
        'Rate',
        'Amount',
        'SharePercent',
        'ShareAmount',
        'isServed',
        'createdBy',
        'isSynced',
    ];

    protected $casts = [
        'Qty' => 'integer',
        'Rate' => 'decimal:2',
        'Amount' => 'decimal:2',
        'SharePercent' => 'decimal:2',
        'ShareAmount' => 'decimal:2',
        'isServed' => 'boolean',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (BillingDetail $model) {
            if (empty($model->Id)) {
                $model->Id = Str::uuid();
            }
        });
    }

    public function billing()
    {
        return $this->belongsTo(Billing::class, 'BillingId');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'serviceId');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }
}
