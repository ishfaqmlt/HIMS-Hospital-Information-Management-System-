<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Doctor extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'Name',
        'Gender',
        'Dob',
        'Email',
        'Phone',
        'Cnic',
        'RegistrationNo',
        'Address',
        'JoiningDate',
        'EmployeementStatus',
        'Stamp',
        'Opd',
        'Surgeon',
        'Anesthetist',
        'isSynced',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    protected $casts = [
        'Dob' => 'date',
        'JoiningDate' => 'date',
        'Opd' => 'boolean',
        'Surgeon' => 'boolean',
        'Anesthetist' => 'boolean',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Doctor $doctor) {
            if (empty($doctor->id)) {
                $doctor->id = Str::uuid();
            }
        });
    }
}
