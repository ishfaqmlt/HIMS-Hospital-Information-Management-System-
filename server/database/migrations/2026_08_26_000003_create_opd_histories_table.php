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
        Schema::create('opd_histories', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Direct link to Patient (Shared across all visits, prescriptions, and doctors)
            $table->foreignUuid('patientId')->references('id')->on('patients')->cascadeOnDelete()->unique();

            // Clinical History Categories
            $table->text('past_medical_history')->nullable();    // e.g. HTN, Diabetes Mellitus, Asthma, IHD
            $table->text('past_surgical_history')->nullable();   // e.g. Appendectomy, Cholecystectomy, C-Section
            $table->text('medication_history')->nullable();      // e.g. Regular long-term drugs (Insulin, Aspirin)
            $table->text('allergy_history')->nullable();         // e.g. Penicillin, NSAIDs, Food / Drug allergies
            $table->text('family_history')->nullable();          // e.g. Family history of CAD, Diabetes, Cancer
            $table->text('social_history')->nullable();          // e.g. Smoking (pack-years), Alcohol, Occupation, Diet

            // Audit Trail
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opd_histories');
    }
};
