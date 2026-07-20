<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insurance_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('InsuranceCompanyId')->constrained('insurance_companies')->onDelete('cascade');
            $table->string('planName', 255);
            $table->text('coverageDetails')->nullable();
            $table->decimal('CoveragePercent', 5, 2)->default(100);
            $table->decimal('AnnualLimit', 10, 2)->nullable();
            $table->boolean('isActive')->default(true);
            $table->boolean('isSynced')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurance_plans');
    }
};
