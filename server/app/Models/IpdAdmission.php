<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class IpdAdmission extends Model
{
    protected $table = 'ipd_admissions';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'patientId',
        'DoctorId',
        'DepartmentId',
        'AdmissionNo',
        'AdmissionDate',
        'DischargeDate',
        'RoomNo',
        'BedNo',
        'AdmissionType',
        'Status',
        'ChiefComplaint',
        'Diagnosis',
        'TreatmentPlan',
        'DischargeSummary',
        'TotalCharges',
        'TotalPaid',
        'Balance',
        'CreatedBy',
        'isSynced',
    ];

    protected $casts = [
        'AdmissionDate' => 'datetime',
        'DischargeDate' => 'datetime',
        'TotalCharges' => 'decimal:2',
        'TotalPaid' => 'decimal:2',
        'Balance' => 'decimal:2',
        'CreatedBy' => 'integer',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (IpdAdmission $model) {
            if (empty($model->Id)) {
                $model->Id = Str::uuid();
            }
        });
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientId');
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'DoctorId');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'DepartmentId');
    }
}
