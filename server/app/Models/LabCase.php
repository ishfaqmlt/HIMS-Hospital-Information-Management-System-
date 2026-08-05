<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LabCase extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'lab_cases';

    protected $fillable = [
        'id',
        'caseNo',
        'visitId',
        'billingId',
        'caseDate',
        'analyzerReffno',
        'insuranceCompanyId',
        'doctorId',
        'orReffBy',
        'priority',
        'status',
        'labCopyPrinted',
        'isSmsSent',
        'isWhatsAppSent',
        'isEmailSent',
        'remarks',
        'createdBy',
        'updatedBy',
    ];

    protected $casts = [
        'caseDate' => 'datetime',
        'labCopyPrinted' => 'boolean',
        'isSmsSent' => 'boolean',
        'isWhatsAppSent' => 'boolean',
        'isEmailSent' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }

    public function tests()
    {
        return $this->hasMany(LabCaseTest::class, 'caseId');
    }

    public function billing()
    {
        return $this->belongsTo(Billing::class, 'billingId');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updatedBy');
    }
}
