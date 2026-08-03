<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabSubHeader extends Model
{
    protected $table = 'lab_sub_headers';

    protected $fillable = [
        'sub_header_name',
        'isSynced',
    ];

    protected $casts = [
        'isSynced' => 'boolean',
    ];
}
