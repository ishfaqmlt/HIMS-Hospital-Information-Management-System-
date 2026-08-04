<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LabSubHeader extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'lab_sub_headers';

    protected $fillable = [
        'id',
        'sub_header_name',
        'isSynced',
    ];

    protected $casts = [
        'isSynced' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }
}
