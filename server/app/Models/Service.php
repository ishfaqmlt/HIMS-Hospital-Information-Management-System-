<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Service extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'Code',
        'DepartmentId',
        'ServiceName',
        'service_type',
        'DefaultCharges',
        'isActive',
        'printToken',
        'isSynced',
    ];

    protected $casts = [
        'DefaultCharges' => 'decimal:2',
        'isActive' => 'boolean',
        'printToken' => 'boolean',
        'isSynced' => 'boolean',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'DepartmentId');
    }

    protected static function booted(): void
    {
        static::creating(function (Service $service) {
            if (empty($service->id)) {
                $service->id = Str::uuid();
            }
        });
    }
}
