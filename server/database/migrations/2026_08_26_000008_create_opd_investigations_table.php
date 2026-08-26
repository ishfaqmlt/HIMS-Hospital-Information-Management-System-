<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opd_investigations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('prescriptionId')->nullable();
            $table->uuid('patientId')->nullable();
            $table->uuid('visitId')->nullable();
            $table->uuid('departmentId')->nullable();
            $table->uuid('serviceId')->nullable();
            $table->string('instructions', 255)->nullable();
            $table->boolean('isSynced')->default(false);

            $table->foreign('prescriptionId')->references('id')->on('opd_prescriptions')->onDelete('cascade');
            $table->foreign('patientId')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('visitId')->references('id')->on('patient_visits')->onDelete('cascade');
            $table->foreign('departmentId')->references('id')->on('departments')->onDelete('set null');
            $table->foreign('serviceId')->references('id')->on('services')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opd_investigations');
    }
};
