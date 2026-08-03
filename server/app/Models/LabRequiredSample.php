<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabRequiredSample extends Model
{
    protected $table = 'lab_required_samples';

    protected $fillable = [
        'required_sample_name',
        'isSynced',
    ];

    protected $casts = [
        'isSynced' => 'boolean',
    ];

    public function masterTests()
    {
        return $this->hasMany(LabMasterTest::class, 'lab_required_sample_id');
    }
}
