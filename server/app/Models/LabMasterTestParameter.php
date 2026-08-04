<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LabMasterTestParameter extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'lab_master_test_parameters';

    protected $fillable = [
        'id',
        'master_test_id',
        'sub_headers_id',
        'parameterName',
        'defaultValue',
        'units',
        'decimal',
        'resultTemplets',
        'formula',
        'analyzerCode',
        'sortNo',
        'printOnReciept',
        'isActive',
        'normalRange',
        'isSynced',
    ];

    protected $casts = [
        'decimal' => 'integer',
        'sortNo' => 'integer',
        'printOnReciept' => 'boolean',
        'isActive' => 'boolean',
        'isSynced' => 'boolean',
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

    public function masterTest()
    {
        return $this->belongsTo(LabMasterTest::class, 'master_test_id');
    }

    public function subHeader()
    {
        return $this->belongsTo(LabSubHeader::class, 'sub_headers_id');
    }
}
