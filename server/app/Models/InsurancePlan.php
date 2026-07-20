<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class InsurancePlan extends Model
{
    protected $table = 'insurance_plans';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'InsuranceCompanyId',
        'planName',
        'coverageDetails',
        'CoveragePercent',
        'AnnualLimit',
        'isActive',
        'isSynced',
    ];

    protected $casts = [
        'isActive' => 'boolean',
        'isSynced' => 'boolean',
        'CoveragePercent' => 'decimal:2',
        'AnnualLimit' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (InsurancePlan $model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(InsuranceCompany::class, 'InsuranceCompanyId');
    }
}
