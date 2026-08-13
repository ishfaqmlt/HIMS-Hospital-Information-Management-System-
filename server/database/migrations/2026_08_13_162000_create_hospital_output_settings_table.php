<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hospital_output_settings', function (Blueprint $table) {
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
            $table->string('legalDisclaimerText', 255)->default('Thank you for choosing our services');
            $table->double('footerHeightMargin')->default(0);

            // Typography & Design
            $table->string('textFont', 100)->default('Inter');
            $table->double('textSize')->default(12);
            $table->string('reportFormat', 50)->default('A4');

            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hospital_output_settings');
    }
};
