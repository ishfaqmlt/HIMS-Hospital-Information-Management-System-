<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EmergencyCase extends Model
{
    protected $table = 'emergency_cases';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'patientId',
        'DoctorId',
        'DepartmentId',
        'CaseNo',
        'ArrivalDate',
        'DischargeDate',
        'Priority',
        'Status',
        'ChiefComplaint',
        'Diagnosis',
        'Treatment',
        'Notes',
        'TotalCharges',
        'TotalPaid',
        'Balance',
        'CreatedBy',
        'isSynced',
    ];

    protected $casts = [
        'ArrivalDate' => 'datetime',
        'DischargeDate' => 'datetime',
        'TotalCharges' => 'decimal:2',
        'TotalPaid' => 'decimal:2',
        'Balance' => 'decimal:2',
        'CreatedBy' => 'integer',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (EmergencyCase $model) {
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
