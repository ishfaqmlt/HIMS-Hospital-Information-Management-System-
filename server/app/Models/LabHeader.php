<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LabHeader extends Model
{
    protected $table = 'lab_headers';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'header_name',
        'isSynced',
    ];

    protected $casts = [
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (LabHeader $model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }
}
