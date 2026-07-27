<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RoomsWardsMaster extends Model
{
    use HasFactory;

    protected $table = 'rooms_wards_master';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'floorId',
        'RoomWardType',
        'RoomWardName',
        'isFunctional',
        'isSynced',
    ];

    protected $casts = [
        'isFunctional' => 'boolean',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (RoomsWardsMaster $room) {
            if (empty($room->id)) {
                $room->id = Str::uuid();
            }
        });
    }

    public function floor()
    {
        return $this->belongsTo(FloorMaster::class, 'floorId');
    }
}
