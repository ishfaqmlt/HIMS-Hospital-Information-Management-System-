<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OpdDiagnosis extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'opd_diagnoses';

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'prescriptionId',
        'patientId',
        'visitId',
        'diagnosisId',
        'isSynced',
    ];

    public function diagnosis()
    {
        return $this->belongsTo(MasterDiagnosis::class, 'diagnosisId', 'id');
    }

    public function prescription()
    {
        return $this->belongsTo(OpdPrescription::class, 'prescriptionId', 'id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientId', 'id');
    }

    public function visit()
    {
        return $this->belongsTo(PatientVisit::class, 'visitId', 'id');
    }
}
