<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LabMasterTest extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'lab_master_tests';

    protected $fillable = [
        'id',
        'serviceId',
        'lab_required_sample_id',
        'testSort',
        'expectedTime',
        'interpretation',
        'isActive',
        'isSynced',
    ];

    protected $casts = [
        'isActive' => 'boolean',
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

    public function requiredSample()
    {
        return $this->belongsTo(LabRequiredSample::class, 'lab_required_sample_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'serviceId');
    }

    public function parameters()
    {
        return $this->hasMany(LabMasterTestParameter::class, 'master_test_id');
    }
}
