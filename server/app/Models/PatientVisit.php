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
        $prefix = 'V-' . date('my') . '-';
        $last = self::where('visitNo', 'like', "{$prefix}%")
            ->orderByDesc('visitNo')
            ->value('visitNo');

        if ($last) {
            $seq = intval(substr($last, strlen($prefix))) + 1;
        } else {
            $seq = 0;
        }

        return $prefix . $seq;
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
