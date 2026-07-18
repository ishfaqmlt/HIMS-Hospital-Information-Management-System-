<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Billing extends Model
{
    protected $table = 'billings';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'patientId',
        'InvoiceNo',
        'InvoiceDate',
        'InvoiceType',
        'SubTotal',
        'Discount',
        'Tax',
        'TotalAmount',
        'PaidAmount',
        'Balance',
        'PaymentStatus',
        'PaymentMethod',
        'Notes',
        'CreatedBy',
        'isSynced',
    ];

    protected $casts = [
        'InvoiceDate' => 'datetime',
        'SubTotal' => 'decimal:2',
        'Discount' => 'decimal:2',
        'Tax' => 'decimal:2',
        'TotalAmount' => 'decimal:2',
        'PaidAmount' => 'decimal:2',
        'Balance' => 'decimal:2',
        'CreatedBy' => 'integer',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Billing $model) {
            if (empty($model->Id)) {
                $model->Id = Str::uuid();
            }
        });
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientId');
    }
}
