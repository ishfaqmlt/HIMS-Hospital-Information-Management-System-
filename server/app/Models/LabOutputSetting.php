<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabOutputSetting extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'lab_output_settings';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'headerFooterByDefault',
        'showHeader',
        'headerImage',
        'showQrCode',
        'headerHeightMargin',
        'showFooterImage',
        'footerImage',
        'showLegalDisclaimer',
        'legalDisclaimerText',
        'showDoctorSignatures',
        'footerHeightMargin',
        'textFont',
        'textSize',
        'reportFormat',
        'showStaffDetails',
        'staffDetails',
        'printBgLogo',
        'bgLogoImage',
        'approvalByAuthority',
        'showBarcodeOnReport',
        'showApprovedAtOnReport',
        'showReceivedAtOnReport',
        'showReportedAtOnReport',
        'isSynced',
    ];

    protected $casts = [
        'headerFooterByDefault' => 'boolean',
        'showHeader' => 'boolean',
        'showQrCode' => 'boolean',
        'headerHeightMargin' => 'float',
        'showFooterImage' => 'boolean',
        'showLegalDisclaimer' => 'boolean',
        'showDoctorSignatures' => 'boolean',
        'footerHeightMargin' => 'float',
        'textSize' => 'float',
        'showStaffDetails' => 'boolean',
        'printBgLogo' => 'boolean',
        'approvalByAuthority' => 'boolean',
        'showBarcodeOnReport' => 'boolean',
        'showApprovedAtOnReport' => 'boolean',
        'showReceivedAtOnReport' => 'boolean',
        'showReportedAtOnReport' => 'boolean',
        'isSynced' => 'boolean',
    ];
}
