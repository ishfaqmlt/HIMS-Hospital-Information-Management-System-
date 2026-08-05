<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_cases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('caseNo')->unique();
            $table->foreignUuid('visitId')->nullable()->constrained('patient_visits');
            $table->foreignUuid('billingId')->nullable()->constrained('billings')->nullOnDelete();
            $table->dateTime('caseDate');
            $table->string('analyzerReffno')->nullable();
            $table->foreignUuid('insuranceCompanyId')->nullable()->constrained('insurance_companies');
            $table->foreignUuid('doctorId')->nullable()->constrained('doctors');
            $table->string('orReffBy')->nullable();
            $table->enum('priority', ['Normal', 'Urgent'])->default('Normal');
            $table->enum('status', ['Registered', 'Sampled', 'InProcess', 'Reported', 'Approved', 'Cancelled'])->default('Registered');
            $table->boolean('labCopyPrinted')->default(false);
            $table->boolean('isSmsSent')->default(false);
            $table->boolean('isWhatsAppSent')->default(false);
            $table->boolean('isEmailSent')->default(false);
            $table->text('remarks')->nullable();
            $table->foreignId('createdBy')->constrained('users');
            $table->foreignId('updatedBy')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_cases');
    }
};
