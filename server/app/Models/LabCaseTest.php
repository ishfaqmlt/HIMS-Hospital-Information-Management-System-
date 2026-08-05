<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LabCaseTest extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'lab_case_tests';

    protected $fillable = [
        'id',
        'caseId',
        'masterTestId',
        'serviceId',
        'rate',
        'status',
        'sampledAt',
        'sampledBy',
        'isPerformed',
        'performedBy',
        'performedAt',
        'isApproved',
        'approvedBy',
        'approvedAt',
        'showInterpretation',
        'isPrinted',
        'printedAt',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'sampledAt' => 'datetime',
        'isPerformed' => 'boolean',
        'performedAt' => 'datetime',
        'isApproved' => 'boolean',
        'approvedAt' => 'datetime',
        'showInterpretation' => 'boolean',
        'isPrinted' => 'boolean',
        'printedAt' => 'datetime',
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

    public function labCase()
    {
        return $this->belongsTo(LabCase::class, 'caseId');
    }

    public function masterTest()
    {
        return $this->belongsTo(LabMasterTest::class, 'masterTestId');
    }

    public function results()
    {
        return $this->hasMany(LabCaseTestResult::class, 'caseTestId');
    }

    public function sampler()
    {
        return $this->belongsTo(User::class, 'sampledBy');
    }

    public function performer()
    {
        return $this->belongsTo(User::class, 'performedBy');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approvedBy');
    }
}
