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
        $prefix = date('y');
        $lastPatient = self::where('mrn', 'like', "MRN-{$prefix}-%")
            ->orderByRaw("SUBSTRING(mrn, -5) DESC")
            ->first();

        if ($lastPatient) {
            $lastSeq = (int) substr($lastPatient->mrn, -5);
            $newSeq = str_pad($lastSeq + 1, 5, '0', STR_PAD_LEFT);
        } else {
            $newSeq = '00001';
        }

        return "MRN-{$prefix}-{$newSeq}";
    }

    public function visits()
    {
        return $this->hasMany(PatientVisit::class, 'patientId');
    }
}
