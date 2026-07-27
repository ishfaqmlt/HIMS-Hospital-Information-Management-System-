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
        'mrn',
        'DoctorId',
        'AdmissionNo',
        'AdmissionDate',
        'DischargeDate',
        'FloorId',
        'RoomWardId',
        'bedId',
        'AdmissionType',
        'Status',
        'ChiefComplaint',
        'Diagnosis',
        'TreatmentPlan',
        'DischargeSummary',
        'TotalCharges',
        'Discount',
        'PayableAmount',
        'TotalPaid',
        'Balance',
        'createdBy',
        'isSynced',
    ];

    protected $casts = [
        'AdmissionDate' => 'datetime',
        'DischargeDate' => 'datetime',
        'TotalCharges' => 'decimal:2',
        'Discount' => 'decimal:2',
        'PayableAmount' => 'decimal:2',
        'TotalPaid' => 'decimal:2',
        'Balance' => 'decimal:2',
        'createdBy' => 'integer',
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

    public function patientVisit()
    {
        return $this->belongsTo(PatientVisit::class, 'mrn', 'mrn');
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'DoctorId');
    }

    public function floor()
    {
        return $this->belongsTo(FloorMaster::class, 'FloorId');
    }

    public function roomWard()
    {
        return $this->belongsTo(RoomsWardsMaster::class, 'RoomWardId');
    }

    public function bed()
    {
        return $this->belongsTo(BedMaster::class, 'bedId');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }
}
