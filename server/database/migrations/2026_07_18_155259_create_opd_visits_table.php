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
        Schema::create('opd_visits', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->foreignUuid('patientId')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('DoctorId')->constrained('doctors')->cascadeOnDelete();
            $table->foreignUuid('DepartmentId')->nullable()->constrained('departments')->nullOnDelete();
            $table->dateTime('VisitDate');
            $table->string('VisitNo', 20);
            $table->enum('VisitType', ['OPD', 'Followup', 'Emergency'])->default('OPD');
            $table->decimal('ConsultationFee', 10, 2)->default(0);
            $table->text('ChiefComplaint')->nullable();
            $table->text('Diagnosis')->nullable();
            $table->text('Notes')->nullable();
            $table->enum('Status', ['Waiting', 'In Progress', 'Completed', 'Cancelled'])->default('Waiting');
            $table->boolean('isPrescriptionGiven')->default(false);
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
        Schema::dropIfExists('opd_visits');
    }
};
