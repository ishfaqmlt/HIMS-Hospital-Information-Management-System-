<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_visits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('visitNo', 20)->unique();
            $table->foreignUuid('patientId')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('patientTypeId')->constrained('patient_types')->cascadeOnDelete();
            $table->foreignUuid('insuranceCompanyId')->nullable()->constrained('insurance_companies')->nullOnDelete();
            $table->foreignUuid('doctorId')->nullable()->constrained('doctors')->nullOnDelete();
            $table->foreignId('userId')->constrained('users');
            $table->dateTime('visitDate');
            $table->enum('status', ['Waiting', 'In Progress', 'Completed', 'Cancelled'])->default('Waiting');
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_visits');
    }
};
