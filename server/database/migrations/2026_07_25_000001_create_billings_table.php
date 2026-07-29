<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('visitId')->constrained('patient_visits')->cascadeOnDelete();
            $table->string('InvoiceNo', 20)->unique();
            $table->dateTime('InvoiceDate');
            $table->foreignUuid('DepartmentId')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignUuid('DoctorId')->nullable()->constrained('doctors')->nullOnDelete();
            $table->decimal('SubTotal', 12, 2)->default(0);
            $table->decimal('Discount', 12, 2)->default(0);
            $table->decimal('TotalAmount', 12, 2)->default(0);
            $table->enum('PaymentStatus', ['Pending', 'Partial', 'Paid', 'Cancelled'])->default('Pending');
            $table->enum('BillType', ['General', 'IPD', 'Return'])->default('General');
            $table->string('ReturnInvoiceNo', 20)->nullable();
            $table->integer('printedCount')->default(0);
            $table->text('Notes')->nullable();
            $table->foreignId('createdBy')->constrained('users');
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billings');
    }
};
