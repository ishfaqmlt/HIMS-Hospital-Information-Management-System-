<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HospitalOutputSetting extends Model
{
    use HasFactory;

    protected $table = 'hospital_output_settings';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'headerFooterByDefault',
        'showHeader',
        'headerImage',
        'showQrCode',
        'headerHeightMargin',
        'showFooterImage',
        'footerImage',
        'showLegalDisclaimer',
        'legalDisclaimerText',
        'footerHeightMargin',
        'textFont',
        'textSize',
        'reportFormat',
        'isSynced',
    ];

    protected $casts = [
        'headerFooterByDefault' => 'boolean',
        'showHeader' => 'boolean',
        'showQrCode' => 'boolean',
        'headerHeightMargin' => 'float',
        'showFooterImage' => 'boolean',
        'showLegalDisclaimer' => 'boolean',
        'footerHeightMargin' => 'float',
        'textSize' => 'float',
        'isSynced' => 'boolean',
    ];
}
