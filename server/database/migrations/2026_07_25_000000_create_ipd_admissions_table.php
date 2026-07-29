<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipd_admissions', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->foreignUuid('visitId')->constrained('patient_visits');
            $table->foreignUuid('DoctorId')->constrained('doctors')->cascadeOnDelete();
            $table->foreignUuid('FloorId')->constrained('floor_master')->cascadeOnDelete();
            $table->foreignUuid('RoomWardId')->constrained('rooms_wards_master')->cascadeOnDelete();
            $table->foreignUuid('bedId')->constrained('bed_master')->cascadeOnDelete();
            $table->string('AdmissionNo', 20);
            $table->dateTime('AdmissionDate');
            $table->dateTime('DischargeDate')->nullable();
            $table->enum('AdmissionType', ['Elective', 'Emergency', 'Transfer'])->default('Elective');
            $table->enum('Status', ['Admitted', 'Discharged', 'Transferred', 'Cancelled'])->default('Admitted');
            $table->text('ChiefComplaint')->nullable();
            $table->text('Diagnosis')->nullable();
            $table->text('TreatmentPlan')->nullable();
            $table->text('DischargeSummary')->nullable();
            $table->decimal('TotalCharges', 12, 2)->default(0);
            $table->decimal('Discount', 12, 2)->default(0);
            $table->decimal('PayableAmount', 12, 2)->default(0);
            $table->decimal('TotalPaid', 12, 2)->default(0);
            $table->decimal('Balance', 12, 2)->default(0);
            $table->foreignId('createdBy')->constrained('users');
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ipd_admissions');
    }
};
