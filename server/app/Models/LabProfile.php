<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LabProfile extends Model
{
    use HasFactory;

    protected $table = 'lab_profiles';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'type',
        'code',
        'name',
        'phone',
        'email',
        'city',
        'address',
        'isActive',
        'createdBy',
    ];

    protected $casts = [
        'isActive' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (LabProfile $model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }
}
