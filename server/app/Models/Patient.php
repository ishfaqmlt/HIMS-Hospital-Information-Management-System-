<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Patient extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'mrn',
        'cnic',
        'mobile',
        'email',
        'pName',
        'gName',
        'gender',
        'dob',
        'address',
        'isActive',
        'isSynced',
    ];

    protected $casts = [
        'dob' => 'date',
        'isActive' => 'boolean',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Patient $patient) {
            if (empty($patient->id)) {
                $patient->id = Str::uuid();
            }
            if (empty($patient->mrn)) {
                $patient->mrn = self::generateMrn();
            }
        });

        static::saving(function (Patient $patient) {
            if ($patient->pName !== null) {
                $patient->pName = self::toProperCase($patient->pName);
            }
            if ($patient->gName !== null) {
                $patient->gName = self::toProperCase($patient->gName);
            }
            if ($patient->address !== null) {
                $patient->address = self::toProperCase($patient->address);
            }
            if ($patient->email !== null) {
                $trimmedEmail = trim($patient->email);
                $patient->email = $trimmedEmail === '' ? null : strtolower($trimmedEmail);
            }
        });
    }

    public static function toProperCase(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }
        $cleaned = trim(preg_replace('/\s+/', ' ', $value));
        if ($cleaned === '') {
            return '';
        }
        return mb_convert_case(mb_strtolower($cleaned, 'UTF-8'), MB_CASE_TITLE, 'UTF-8');
    }

    public static function generateMrn(): string
    {
        $prefix = 'MRN-' . date('y') . '-';

        return \Illuminate\Support\Facades\DB::transaction(function () use ($prefix) {
            $sequence = \Illuminate\Support\Facades\DB::table('system_sequences')
                ->where('prefix', $prefix)
                ->lockForUpdate()
                ->first();

            if (!$sequence) {
                // Extract max integer sequence after prefix (first 9 characters)
                $maxSeq = \Illuminate\Support\Facades\DB::table('patients')
                    ->where('mrn', 'like', "{$prefix}%")
                    ->get()
                    ->map(function ($row) use ($prefix) {
                        return intval(substr($row->mrn, strlen($prefix)));
                    })
                    ->max();

                $startVal = $maxSeq ? $maxSeq + 1 : 1;

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

            return $prefix . $nextVal;
        });
    }

    public function visits()
    {
        return $this->hasMany(PatientVisit::class, 'patientId');
    }
}
