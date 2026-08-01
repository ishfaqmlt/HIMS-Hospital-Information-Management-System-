<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PatientPayment extends Model
{
    protected $table = 'patient_payments';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'visitId',
        'billingId',
        'mrn',
        'invoiceNo',
        'debit',
        'credit',
        'remarks',
        'createdBy',
        'isSynced',
    ];

    protected $casts = [
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (PatientPayment $model) {
            if (empty($model->Id)) {
                $model->Id = Str::uuid();
            }
        });
    }

    public function patientVisit()
    {
        return $this->belongsTo(PatientVisit::class, 'visitId');
    }

    public function billing()
    {
        return $this->belongsTo(Billing::class, 'invoiceNo', 'InvoiceNo');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }
}
