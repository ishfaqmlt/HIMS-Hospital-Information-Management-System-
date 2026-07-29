<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PatientVisit extends Model
{
    protected $table = 'patient_visits';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'visitNo',
        'patientId',
        'patientTypeId',
        'insuranceCompanyId',
        'doctorId',
        'userId',
        'visitDate',
        'status',
        'isSynced',
    ];

    protected $casts = [
        'visitDate' => 'datetime',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (PatientVisit $visit) {
            if (empty($visit->id)) {
                $visit->id = Str::uuid();
            }
            if (empty($visit->visitNo)) {
                $visit->visitNo = self::generateVisitNo();
            }
        });
    }

    public static function generateVisitNo(): string
    {
        $prefix = date('my');
        $lastVisit = self::where('visitNo', 'like', "V-{$prefix}-%")
            ->orderByRaw("SUBSTRING(visitNo, -3) DESC")
            ->first();

        if ($lastVisit) {
            $lastSeq = (int) substr($lastVisit->visitNo, -3);
            $newSeq = str_pad($lastSeq + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $newSeq = '001';
        }

        return "V-{$prefix}-{$newSeq}";
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientId');
    }

    public function patientType()
    {
        return $this->belongsTo(PatientType::class, 'patientTypeId');
    }

    public function insuranceCompany()
    {
        return $this->belongsTo(InsuranceCompany::class, 'insuranceCompanyId');
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctorId');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }
}
