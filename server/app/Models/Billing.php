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
        'visitId',
        'InvoiceNo',
        'InvoiceDate',
        'mrn',
        'patientTypeId',
        'InsuranceCompanyId',
        'DepartmentId',
        'DoctorId',
        'tokenNo',
        'SubTotal',
        'Discount',
        'TotalAmount',
        'PaymentStatus',
        'printedCount',
        'BillType',
        'ReturnBillingId',
        'isEditLocked',
        'Notes',
        'postedBy',
        'postedAt',
        'createdBy',
        'updatedBy',
        'isSynced',
    ];

    protected $casts = [
        'InvoiceDate' => 'datetime',
        'SubTotal' => 'decimal:2',
        'Discount' => 'decimal:2',
        'TotalAmount' => 'decimal:2',
        'printedCount' => 'integer',
        'isEditLocked' => 'boolean',
        'isSynced' => 'boolean',
        'postedAt' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Billing $model) {
            if (empty($model->Id)) {
                $model->Id = Str::uuid();
            }
            if (empty($model->InvoiceNo)) {
                $model->InvoiceNo = self::generateInvoiceNo();
            }
        });
    }

    public static function generateInvoiceNo(): string
    {
        $now = now();
        $prefix = 'INV-' . $now->format('my');

        $count = Billing::where('InvoiceNo', 'like', "{$prefix}-%")->count() + 1;

        return $prefix . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
    }

    public function patientVisit()
    {
        return $this->belongsTo(PatientVisit::class, 'visitId');
    }

    public function patientType()
    {
        return $this->belongsTo(PatientType::class, 'patientTypeId');
    }

    public function insuranceCompany()
    {
        return $this->belongsTo(InsuranceCompany::class, 'InsuranceCompanyId');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'DepartmentId');
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'DoctorId');
    }

    public function postedByUser()
    {
        return $this->belongsTo(User::class, 'postedBy');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }

    public function payments()
    {
        return $this->belongsToMany(PatientPayment::class, 'billing_payments', 'billingId', 'paymentId')
            ->withPivot('amount')
            ->withTimestamps();
    }
}
