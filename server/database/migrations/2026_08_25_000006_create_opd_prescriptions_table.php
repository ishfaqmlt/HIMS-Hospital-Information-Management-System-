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
        Schema::create('opd_prescriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('prescriptionNo', 20)->unique();
            $table->string('visitId', 36);
            $table->string('patientId', 36);
            $table->string('doctorId', 36);
            $table->dateTime('presc_date')->default(now());
            $table->text('advice')->nullable();
            $table->date('followUpDate')->nullable();
            $table->enum('status', ['pending', 'In Process', 'completed'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opd_prescriptions');
    }
};
