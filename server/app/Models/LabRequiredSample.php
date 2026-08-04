<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LabRequiredSample extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'lab_required_samples';

    protected $fillable = [
        'id',
        'required_sample_name',
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

    public function masterTests()
    {
        return $this->hasMany(LabMasterTest::class, 'lab_required_sample_id');
    }
}
