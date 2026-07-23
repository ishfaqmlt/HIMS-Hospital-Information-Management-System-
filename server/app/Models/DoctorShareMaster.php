<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class DoctorShareMaster extends Model
{
    protected $table = 'doctor_share_master';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'DepartmentId',
        'ServiceId',
        'doctorId',
        'DoctorShare',
        'hospitalShare',
        'isSynced',
    ];

    protected $casts = [
        'DoctorShare' => 'decimal:2',
        'hospitalShare' => 'decimal:2',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (DoctorShareMaster $model) {
            if (empty($model->Id)) {
                $model->Id = Str::uuid();
            }
        });
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'DepartmentId');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'ServiceId');
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctorId');
    }
}
