<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabMasterTest extends Model
{
    protected $table = 'lab_master_tests';

    protected $fillable = [
        'testCode',
        'testName',
        'lab_required_sample_id',
        'testSort',
        'expectedTime',
        'interpretation',
        'isActive',
        'isSynced',
    ];

    protected $casts = [
        'isActive' => 'boolean',
        'isSynced' => 'boolean',
    ];

    public function requiredSample()
    {
        return $this->belongsTo(LabRequiredSample::class, 'lab_required_sample_id');
    }
}
