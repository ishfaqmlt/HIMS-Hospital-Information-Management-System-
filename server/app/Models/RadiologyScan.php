<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RadiologyScan extends Model
{
    protected $table = 'radiology_scans';
    protected $primaryKey = 'Id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'ScanCode',
        'ScanName',
        'Category',
        'DepartmentId',
        'Price',
        'Description',
        'PreparationNotes',
        'DurationMinutes',
        'isActive',
        'CreatedBy',
        'isSynced',
    ];

    protected $casts = [
        'Price' => 'decimal:2',
        'DurationMinutes' => 'integer',
        'isActive' => 'boolean',
        'CreatedBy' => 'integer',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (RadiologyScan $model) {
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
