<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ServiceCharge extends Model
{
    protected $table = 'service_charges';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'doctorId',
        'ServiceId',
        'departmentId',
        'Charges',
        'isSynced',
    ];

    protected $casts = [
        'Charges' => 'decimal:2',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (ServiceCharge $model) {
            if (empty($model->Id)) {
                $model->Id = Str::uuid();
            }
        });
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctorId');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'ServiceId');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'departmentId');
    }
}
