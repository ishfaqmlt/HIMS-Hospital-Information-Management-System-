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

        return \Illuminate\Support\Facades\DB::transaction(function () use ($prefix) {
            $sequence = \Illuminate\Support\Facades\DB::table('system_sequences')
                ->where('prefix', $prefix)
                ->lockForUpdate()
                ->first();

            if (!$sequence) {
                $last = \Illuminate\Support\Facades\DB::table('patient_visits')
                    ->where('visitNo', 'like', "{$prefix}%")
                    ->orderByDesc('visitNo')
                    ->value('visitNo');

                $startVal = $last ? intval(substr($last, strlen($prefix))) + 1 : 1;

                \Illuminate\Support\Facades\DB::table('system_sequences')->insert([
                    'prefix' => $prefix,
                    'current_value' => $startVal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $nextVal = $startVal;
            } else {
                $nextVal = $sequence->current_value + 1;
                \Illuminate\Support\Facades\DB::table('system_sequences')
                    ->where('prefix', $prefix)
                    ->update([
                        'current_value' => $nextVal,
                        'updated_at' => now(),
                    ]);
            }

            return $prefix . str_pad($nextVal, 3, '0', STR_PAD_LEFT);
        });
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientId');
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
