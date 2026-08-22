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
        Schema::create('patient_vitals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Foreign Keys (UUIDs matching patients and patient_visits)
            $table->foreignUuid('patientId')->references('id')->on('patients')->onDelete('cascade');
            $table->foreignUuid('visitId')->nullable()->references('id')->on('patient_visits')->onDelete('cascade');
            
            // Core Vital Signs
            $table->integer('systolic')->nullable();          // e.g. 120 (mmHg)
            $table->integer('diastolic')->nullable();         // e.g. 80 (mmHg)
            $table->string('blood_pressure', 20)->nullable(); // e.g. "120/80"
            $table->integer('pulse_rate')->nullable();        // e.g. 76 (bpm)
            $table->decimal('temperature', 4, 1)->nullable(); // e.g. 98.6 (°F)
            $table->integer('respiratory_rate')->nullable();  // e.g. 18 (breaths/min)
            $table->decimal('spo2', 5, 2)->nullable();        // e.g. 98 (%)
            $table->decimal('weight', 5, 2)->nullable();      // e.g. 68.5 (kg)
            $table->decimal('height', 5, 2)->nullable();      // e.g. 172.5 (cm)
            $table->decimal('bmi', 4, 1)->nullable();         // e.g. 23.0 (kg/m²)
            $table->decimal('bsr', 5, 1)->nullable();         // e.g. 110 (Blood Sugar mg/dL)
            $table->text('notes')->nullable();                // Clinical notes/remarks
            
            // Audit & Timestamps
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_vitals');
    }
};
