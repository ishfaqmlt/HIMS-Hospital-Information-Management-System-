<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class OpdVisit extends Model
{
    protected $table = 'opd_visits';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'patientId',
        'DoctorId',
        'DepartmentId',
        'VisitDate',
        'VisitNo',
        'VisitType',
        'ConsultationFee',
        'ChiefComplaint',
        'Diagnosis',
        'Notes',
        'Status',
        'isPrescriptionGiven',
        'CreatedBy',
        'isSynced',
    ];

    protected $casts = [
        'VisitDate' => 'datetime',
        'ConsultationFee' => 'decimal:2',
        'isPrescriptionGiven' => 'boolean',
        'CreatedBy' => 'integer',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (OpdVisit $model) {
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
