<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Department extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'DepartmentName',
        'ServingBy',
        'isActive',
        'isSynced',
    ];

    protected $casts = [
        'isActive' => 'boolean',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Department $department) {
            if (empty($department->id)) {
                $department->id = Str::uuid();
            }
        });
    }
}
