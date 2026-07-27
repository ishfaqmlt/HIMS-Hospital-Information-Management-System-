<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BedMaster extends Model
{
    use HasFactory;

    protected $table = 'bed_master';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'floorId',
        'roomWardId',
        'BedNo',
        'Rent',
        'AcCharges',
        'isOccupied',
        'isFunctional',
        'isSynced',
    ];

    protected $casts = [
        'Rent' => 'decimal:2',
        'AcCharges' => 'decimal:2',
        'isOccupied' => 'boolean',
        'isFunctional' => 'boolean',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (BedMaster $bed) {
            if (empty($bed->id)) {
                $bed->id = Str::uuid();
            }
        });
    }

    public function floor()
    {
        return $this->belongsTo(FloorMaster::class, 'floorId');
    }

    public function roomWard()
    {
        return $this->belongsTo(RoomsWardsMaster::class, 'roomWardId');
    }
}
