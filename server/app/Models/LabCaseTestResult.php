<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LabCaseTestResult extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'lab_case_test_results';

    protected $fillable = [
        'id',
        'caseTestId',
        'parameterId',
        'result',
        'units',
        'paramStatus',
        'isPrint',
        'normalRange',
    ];

    protected $casts = [
        'isPrint' => 'boolean',
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

    public function caseTest()
    {
        return $this->belongsTo(LabCaseTest::class, 'caseTestId');
    }

    public function parameter()
    {
        return $this->belongsTo(LabMasterTestParameter::class, 'parameterId');
    }
}
