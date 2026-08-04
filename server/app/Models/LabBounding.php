<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LabBounding extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'lab_boundings';

    protected $fillable = [
        'id',
        'parameterId',
        'gender',
        'fromAge',
        'toAge',
        'ageType',
        'lowerBound',
        'upperBound',
        'lowerCritical',
        'upperCritical',
        'fromAgeDays',
        'toAgeDays',
        'isSynced',
    ];

    protected $casts = [
        'fromAge' => 'integer',
        'toAge' => 'integer',
        'lowerBound' => 'double',
        'upperBound' => 'double',
        'lowerCritical' => 'double',
        'upperCritical' => 'double',
        'fromAgeDays' => 'integer',
        'toAgeDays' => 'integer',
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

    public function parameter()
    {
        return $this->belongsTo(LabMasterTestParameter::class, 'parameterId');
    }
}
