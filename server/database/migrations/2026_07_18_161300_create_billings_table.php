<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billings', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->string('InvoiceNo', 20)->unique();
            $table->dateTime('InvoiceDate');
            $table->string('mrn', 50)->constrained('patient_visits', 'mrn')->onDelete('cascade');
            $table->foreignUuid('patientTypeId')->constrained('patient_types')->onDelete('cascade');
            $table->uuid('InsuranceCompanyId')->nullable()->index();
            $table->foreignUuid('DepartmentId')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignUuid('DoctorId')->nullable()->constrained('doctors')->onDelete('set null');
            $table->decimal('SubTotal', 12, 2)->default(0);
            $table->decimal('Discount', 12, 2)->default(0);
            $table->decimal('TotalAmount', 12, 2)->default(0);
            $table->enum('PaymentStatus', ['Pending', 'Partial', 'Paid', 'Cancelled'])->default('Pending');
            $table->integer('printedCount')->default(0);
            $table->enum('BillType', ['Normal', 'Return'])->default('Normal');
            $table->uuid('ReturnBillingId')->nullable()->index();
            $table->boolean('isEditLocked')->default(false);
            $table->text('Notes')->nullable();
            $table->foreignId('postedBy')->nullable()->constrained('users')->onDelete('set null');
            $table->dateTime('postedAt')->nullable();
            $table->foreignId('createdBy')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updatedBy')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billings');
    }
};
