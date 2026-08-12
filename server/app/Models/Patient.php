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
        'allergy',
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
    }

    public static function generateMrn(): string
    {
        $prefix = 'mrn-' . date('my') . '-';

        return \Illuminate\Support\Facades\DB::transaction(function () use ($prefix) {
            $sequence = \Illuminate\Support\Facades\DB::table('system_sequences')
                ->where('prefix', $prefix)
                ->lockForUpdate()
                ->first();

            if (!$sequence) {
                $last = \Illuminate\Support\Facades\DB::table('patients')
                    ->where('mrn', 'like', "{$prefix}%")
                    ->orderByDesc('mrn')
                    ->value('mrn');

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

    public function visits()
    {
        return $this->hasMany(PatientVisit::class, 'patientId');
    }
}
