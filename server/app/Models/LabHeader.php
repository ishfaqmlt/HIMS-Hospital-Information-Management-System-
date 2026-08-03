<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabHeader extends Model
{
    protected $table = 'lab_headers';

    protected $fillable = [
        'header_name',
        'isSynced',
    ];

    protected $casts = [
        'isSynced' => 'boolean',
    ];
}
