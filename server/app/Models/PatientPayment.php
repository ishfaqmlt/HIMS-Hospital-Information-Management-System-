<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PatientPayment extends Model
{
    protected $table = 'patient_payments';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'visitId',
        'mrn',
        'invoiceNo',
        'debit',
        'credit',
        'payerType',
        'insuranceCompanyId',
        'status',
        'advanceBalance',
        'remarks',
        'createdBy',
        'isSynced',
    ];

    protected $casts = [
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
        'advanceBalance' => 'decimal:2',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (PatientPayment $model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }

    public function patientVisit()
    {
        return $this->belongsTo(PatientVisit::class, 'visitId');
    }

    public function billings()
    {
        return $this->belongsToMany(Billing::class, 'billing_payments', 'paymentId', 'billingId')
            ->withPivot('amount')
            ->withTimestamps();
    }

    public function paymentDetails()
    {
        return $this->hasMany(PaymentDetail::class, 'paymentId');
    }

    public function insuranceCompany()
    {
        return $this->belongsTo(InsuranceCompany::class, 'insuranceCompanyId');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }
}
