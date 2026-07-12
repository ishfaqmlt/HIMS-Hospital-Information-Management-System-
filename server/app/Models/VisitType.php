<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class VisitType extends Model
{
    use HasFactory;

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
        static::creating(function (VisitType $visitType) {
            if (empty($visitType->id)) {
                $visitType->id = Str::uuid();
            }
        });
    }
}
