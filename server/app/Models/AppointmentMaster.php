<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AppointmentMaster extends Model
{
    protected $table = 'appointment_master';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'DoctorId',
        'DayOfWeek',
        'StartTime',
        'EndTime',
        'SlotTime',
        'BookingType',
        'SilentSlots',
        'MaxBookings',
        'isSynced',
    ];

    protected $casts = [
        'StartTime' => 'datetime:H:i',
        'EndTime' => 'datetime:H:i',
        'SlotTime' => 'integer',
        'SilentSlots' => 'integer',
        'MaxBookings' => 'integer',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (AppointmentMaster $model) {
            if (empty($model->Id)) {
                $model->Id = Str::uuid();
            }
        });
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'DoctorId');
    }
}
