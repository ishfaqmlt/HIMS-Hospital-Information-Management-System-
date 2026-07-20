<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class InsuranceCompany extends Model
{
    protected $table = 'insurance_companies';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'phone',
        'contactPerson',
        'mobile',
        'email',
        'address',
        'isCredit',
        'validityHours',
        'discount',
        'isActive',
        'CreatedAt',
        'UpdatedAt',
        'isSynced',
    ];

    protected $casts = [
        'isCredit' => 'boolean',
        'isActive' => 'boolean',
        'isSynced' => 'boolean',
        'discount' => 'decimal:2',
        'validityHours' => 'integer',
        'CreatedAt' => 'datetime',
        'UpdatedAt' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (InsuranceCompany $model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }
}
