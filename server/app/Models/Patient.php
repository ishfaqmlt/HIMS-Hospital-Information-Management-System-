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
        'patientId',
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
        });
    }

    public function visits()
    {
        return $this->hasMany(PatientVisit::class, 'patientId');
    }
}
