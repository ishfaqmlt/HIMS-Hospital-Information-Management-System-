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
        Schema::create('emergency_cases', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->foreignUuid('patientId')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('DoctorId')->nullable()->constrained('doctors')->nullOnDelete();
            $table->foreignUuid('DepartmentId')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('CaseNo', 20);
            $table->dateTime('ArrivalDate');
            $table->dateTime('DischargeDate')->nullable();
            $table->enum('Priority', ['Critical', 'Urgent', 'Standard'])->default('Urgent');
            $table->enum('Status', ['Active', 'Discharged', 'Transferred', 'Deceased', 'Cancelled'])->default('Active');
            $table->text('ChiefComplaint')->nullable();
            $table->text('Diagnosis')->nullable();
            $table->text('Treatment')->nullable();
            $table->text('Notes')->nullable();
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
        Schema::dropIfExists('emergency_cases');
    }
};
