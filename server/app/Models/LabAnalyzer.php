<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LabAnalyzer extends Model
{
    protected $table = 'lab_analyzers';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'manufacturer',
        'model',
        'communicationType',
        'protocol',
        'direction',
        'host',
        'port',
        'comPort',
        'baudRate',
        'parity',
        'dataBits',
        'stopBits',
        'isActive',
        'lastConnectedAt',
    ];

    protected $casts = [
        'port' => 'integer',
        'baudRate' => 'integer',
        'dataBits' => 'integer',
        'stopBits' => 'float',
        'isActive' => 'boolean',
        'lastConnectedAt' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }
}
