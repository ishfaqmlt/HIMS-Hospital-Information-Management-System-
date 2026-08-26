<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OpdHistory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'opd_histories';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'patientId',
        'past_medical_history',
        'past_surgical_history',
        'medication_history',
        'allergy_history',
        'family_history',
        'social_history',
        'updated_by',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientId', 'id');
    }

    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
