<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OpdInvestigation extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'opd_investigations';

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'prescriptionId',
        'patientId',
        'visitId',
        'departmentId',
        'serviceId',
        'instructions',
        'isSynced',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class, 'serviceId', 'id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'departmentId', 'id');
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
