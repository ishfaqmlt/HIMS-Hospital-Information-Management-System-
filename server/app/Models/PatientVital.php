<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientVital extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'patient_vitals';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'patientId',
        'visitId',
        'systolic',
        'diastolic',
        'blood_pressure',
        'pulse_rate',
        'temperature',
        'respiratory_rate',
        'spo2',
        'weight',
        'height',
        'bmi',
        'bsr',
        'notes',
        'recorded_by',
        'recorded_at',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientId');
    }

    public function visit()
    {
        return $this->belongsTo(PatientVisit::class, 'visitId');
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
