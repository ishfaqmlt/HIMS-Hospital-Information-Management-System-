<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BillingPayment extends Model
{
    protected $table = 'billing_payments';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'billingId',
        'paymentId',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (BillingPayment $model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }

    public function billing()
    {
        return $this->belongsTo(Billing::class, 'billingId');
    }

    public function patientPayment()
    {
        return $this->belongsTo(PatientPayment::class, 'paymentId');
    }
}
