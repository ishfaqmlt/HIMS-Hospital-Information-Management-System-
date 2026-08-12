<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabOutputSettingSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('lab_output_settings')->count() === 0) {
            DB::table('lab_output_settings')->insert([
                'id' => Str::uuid(),
                'headerFooterByDefault' => true,
                'showHeader' => true,
                'headerImage' => null,
                'showQrCode' => true,
                'headerHeightMargin' => 0,
                'showFooterImage' => false,
                'footerImage' => null,
                'showLegalDisclaimer' => true,
                'legalDisclaimerText' => 'NOT VALID FOR ANY COURT OF LAW',
                'showDoctorSignatures' => true,
                'footerHeightMargin' => 0,
                'textFont' => 'Inter',
                'textSize' => 12,
                'reportFormat' => 'A4',
                'showStaffDetails' => true,
                'staffDetails' => 'Report Prepared By Authorized Lab Staff',
                'printBgLogo' => false,
                'bgLogoImage' => null,
                'approvalByAuthority' => true,
                'showBarcodeOnReport' => true,
                'showApprovedAtOnReport' => true,
                'showReceivedAtOnReport' => true,
                'showReportedAtOnReport' => true,
                'isSynced' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
