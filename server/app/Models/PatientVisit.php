<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PatientVisit extends Model
{
    protected $table = 'patient_visits';

    public $incrementing = false;
    protected $primaryKey = 'mrn';
    protected $keyType = 'string';

    protected $fillable = [
        'mrn',
        'patientId',
        'patientTypeId',
        'InsuranceCompanyId',
        'doctorId',
        'UserId',
        'isSynced',
    ];

    protected $casts = [
        'isSynced' => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientId', 'patientId');
    }

    public function patientType()
    {
        return $this->belongsTo(PatientType::class, 'patientTypeId');
    }

    public function insuranceCompany()
    {
        return $this->belongsTo(InsuranceCompany::class, 'InsuranceCompanyId');
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctorId');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'UserId');
    }

    public static function generateMrn(): string
    {
        $today = now();
        $datePart = $today->format('dmY');

        $count = PatientVisit::whereDate('created_at', $today->toDateString())->count() + 1;

        return 'MRN-' . str_pad($count, 2, '0', STR_PAD_LEFT) . '-' . $datePart;
    }

    protected static function booted(): void
    {
        static::creating(function (PatientVisit $model) {
            if (empty($model->mrn)) {
                $model->mrn = self::generateMrn();
            }
        });
    }
}
