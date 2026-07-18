<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LabTest extends Model
{
    protected $table = 'lab_tests';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'TestCode',
        'TestName',
        'Category',
        'DepartmentId',
        'Price',
        'Description',
        'NormalRange',
        'Unit',
        'isActive',
        'CreatedBy',
        'isSynced',
    ];

    protected $casts = [
        'Price' => 'decimal:2',
        'isActive' => 'boolean',
        'CreatedBy' => 'integer',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (LabTest $model) {
            if (empty($model->Id)) {
                $model->Id = Str::uuid();
            }
        });
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'DepartmentId');
    }
}
