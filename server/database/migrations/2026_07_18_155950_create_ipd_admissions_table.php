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
        Schema::create('ipd_admissions', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->foreignUuid('patientId')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('DoctorId')->constrained('doctors')->cascadeOnDelete();
            $table->foreignUuid('DepartmentId')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('AdmissionNo', 20);
            $table->dateTime('AdmissionDate');
            $table->dateTime('DischargeDate')->nullable();
            $table->string('RoomNo', 20)->nullable();
            $table->string('BedNo', 20)->nullable();
            $table->enum('AdmissionType', ['Elective', 'Emergency', 'Transfer'])->default('Elective');
            $table->enum('Status', ['Admitted', 'Discharged', 'Transferred', 'Cancelled'])->default('Admitted');
            $table->text('ChiefComplaint')->nullable();
            $table->text('Diagnosis')->nullable();
            $table->text('TreatmentPlan')->nullable();
            $table->text('DischargeSummary')->nullable();
            $table->decimal('TotalCharges', 12, 2)->default(0);
            $table->decimal('TotalPaid', 12, 2)->default(0);
            $table->decimal('Balance', 12, 2)->default(0);
            $table->unsignedBigInteger('CreatedBy');
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ipd_admissions');
    }
};
