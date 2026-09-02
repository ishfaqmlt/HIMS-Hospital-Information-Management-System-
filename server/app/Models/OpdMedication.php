<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OpdMedication extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'opd_medications';

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = true;

    protected $fillable = [
        'id',
        'prescriptionId',
        'patientId',
        'visitId',
        'medicineId',
        'medicineName',
        'genericName',
        'dosageForm',
        'dosage',
        'frequency',
        'duration',
        'instruction',
        'quantity',
        'isSynced',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'isSynced' => 'boolean',
    ];

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

    public function medicine()
    {
        return $this->belongsTo(PharmacyMedicine::class, 'medicineId', 'id');
    }
}
