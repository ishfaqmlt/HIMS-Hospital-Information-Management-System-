<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_visits', function (Blueprint $table) {
            $table->string('mrn', 50)->primary();
            $table->foreignUuid('patientId')->constrained('patients', 'patientId')->onDelete('cascade');
            $table->foreignUuid('patientTypeId')->constrained('patient_types')->onDelete('cascade');
            $table->foreignUuid('InsuranceCompanyId')->nullable()->constrained('insurance_companies');
            $table->foreignUuid('doctorId')->nullable()->constrained('doctors');
            $table->foreignId('UserId')->constrained('users');
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_visits');
    }
};
