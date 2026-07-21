<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PatientType extends Model
{
    use HasFactory;

    protected $table = 'patient_types';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'visitType',
        'isSynced',
    ];

    protected $casts = [
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (PatientType $patientType) {
            if (empty($patientType->id)) {
                $patientType->id = Str::uuid();
            }
        });
    }
}
