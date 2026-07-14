<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PatientAppointment extends Model
{
    protected $table = 'patient_appointments';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'DoctorId',
        'patientId',
        'Appointmentat',
        'TokenNo',
        'Status',
        'Remarks',
        'isReminderSent',
        'CreatedBy',
        'isSynced',
    ];

    protected $casts = [
        'Appointmentat' => 'datetime',
        'TokenNo' => 'integer',
        'isReminderSent' => 'boolean',
        'CreatedBy' => 'integer',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (PatientAppointment $model) {
            if (empty($model->Id)) {
                $model->Id = Str::uuid();
            }
        });
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'DoctorId');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientId');
    }
}
