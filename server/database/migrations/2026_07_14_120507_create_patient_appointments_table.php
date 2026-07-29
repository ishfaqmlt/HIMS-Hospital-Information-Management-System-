<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_appointments', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->foreignUuid('DoctorId')->constrained('doctors')->cascadeOnDelete();
            $table->string('mrn', 20)->constrained('patients', 'mrn')->cascadeOnDelete();
            $table->dateTime('Appointmentat');
            $table->integer('TokenNo')->default(1);
            $table->enum('Status', ['Pending', 'Booked', 'Cancelled', 'Completed']);
            $table->string('Remarks', 255)->nullable();
            $table->boolean('isReminderSent')->default(false);
            $table->unsignedBigInteger('CreatedBy');
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_appointments');
    }
};
