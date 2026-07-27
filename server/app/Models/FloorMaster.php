<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class FloorMaster extends Model
{
    use HasFactory;

    protected $table = 'floor_master';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'FloorName',
        'isFunctional',
        'isSynced',
    ];

    protected $casts = [
        'isFunctional' => 'boolean',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (FloorMaster $floor) {
            if (empty($floor->id)) {
                $floor->id = Str::uuid();
            }
        });
    }
}
