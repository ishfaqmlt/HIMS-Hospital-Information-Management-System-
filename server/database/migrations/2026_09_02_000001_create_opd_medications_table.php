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
        Schema::create('opd_medications', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Core Relationships
            $table->foreignUuid('prescriptionId')->nullable()->references('id')->on('opd_prescriptions')->cascadeOnDelete();
            $table->foreignUuid('patientId')->nullable()->references('id')->on('patients')->cascadeOnDelete();
            $table->foreignUuid('visitId')->nullable()->references('id')->on('patient_visits')->cascadeOnDelete();

            // Pharmacy Inventory Link
            $table->foreignUuid('medicineId')->nullable()->references('id')->on('pharmacy_medicines')->nullOnDelete();
            $table->string('medicineName', 200);
            $table->string('genericName', 200)->nullable();
            $table->string('dosageForm', 100)->nullable();
            $table->string('dosage', 100)->nullable();

            // Prescribed Regimen (Support English & Urdu text)
            $table->string('frequency', 191)->nullable();
            $table->string('duration', 191)->nullable();
            $table->string('instruction', 255)->nullable();

            $table->integer('quantity')->default(1);
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opd_medications');
    }
};
