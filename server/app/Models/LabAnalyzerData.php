<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LabAnalyzerData extends Model
{
    protected $table = 'lab_analyzer_data';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'analyzerId',
        'analyzerReffno',
        'tdate',
        'paramName',
        'result',
        'unit',
        'flag',
        'isSynced',
    ];

    protected $casts = [
        'tdate' => 'datetime',
        'isSynced' => 'boolean',
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

    public function analyzer()
    {
        return $this->belongsTo(LabAnalyzer::class, 'analyzerId');
    }
}
