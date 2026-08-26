<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('opd_diagnoses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('prescriptionId')->nullable()->references('id')->on('opd_prescriptions')->cascadeOnDelete();
            $table->foreignUuid('patientId')->nullable()->references('id')->on('patients')->cascadeOnDelete();
            $table->foreignUuid('visitId')->nullable()->references('id')->on('patient_visits')->cascadeOnDelete();
            $table->foreignUuid('diagnosisId')->nullable()->references('id')->on('master_diagnosis')->cascadeOnDelete();
            $table->boolean('isSynced')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opd_diagnoses');
    }
};
