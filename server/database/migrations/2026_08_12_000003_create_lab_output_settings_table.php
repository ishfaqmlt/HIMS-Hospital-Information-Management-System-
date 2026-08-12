<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_output_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Header & Letterhead settings
            $table->boolean('headerFooterByDefault')->default(true);
            $table->boolean('showHeader')->default(true);
            $table->string('headerImage', 255)->nullable();
            $table->boolean('showQrCode')->default(true);
            $table->double('headerHeightMargin')->default(0);

            // Footer settings
            $table->boolean('showFooterImage')->default(false);
            $table->string('footerImage', 255)->nullable();
            $table->boolean('showLegalDisclaimer')->default(true);
            $table->string('legalDisclaimerText', 255)->default('NOT VALID FOR ANY COURT OF LAW');
            $table->boolean('showDoctorSignatures')->default(true);
            $table->double('footerHeightMargin')->default(0);

            // Typography & Design
            $table->string('textFont', 100)->default('Inter');
            $table->double('textSize')->default(12);
            $table->string('reportFormat', 50)->default('A4');

            // Staff / User Details
            $table->boolean('showStaffDetails')->default(true);
            $table->text('staffDetails')->nullable();

            // Watermark / Background Logo
            $table->boolean('printBgLogo')->default(false);
            $table->string('bgLogoImage', 255)->nullable();

            // Verification & Barcode / Timestamps
            $table->boolean('approvalByAuthority')->default(true);
            $table->boolean('showBarcodeOnReport')->default(true);
            $table->boolean('showApprovedAtOnReport')->default(true);
            $table->boolean('showReceivedAtOnReport')->default(true);
            $table->boolean('showReportedAtOnReport')->default(true);

            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_output_settings');
    }
};
