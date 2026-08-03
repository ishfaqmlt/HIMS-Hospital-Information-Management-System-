<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PaymentDetail extends Model
{
    protected $table = 'payment_details';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'paymentId',
        'paymentMode',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (PaymentDetail $model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }

    public function patientPayment()
    {
        return $this->belongsTo(PatientPayment::class, 'paymentId');
    }
}
