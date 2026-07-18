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
        Schema::create('billings', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->foreignUuid('patientId')->constrained('patients')->cascadeOnDelete();
            $table->string('InvoiceNo', 20);
            $table->dateTime('InvoiceDate');
            $table->enum('InvoiceType', ['OPD', 'IPD', 'Emergency', 'Laboratory', 'Pharmacy', 'Radiology', 'Other'])->default('OPD');
            $table->decimal('SubTotal', 12, 2)->default(0);
            $table->decimal('Discount', 12, 2)->default(0);
            $table->decimal('Tax', 12, 2)->default(0);
            $table->decimal('TotalAmount', 12, 2)->default(0);
            $table->decimal('PaidAmount', 12, 2)->default(0);
            $table->decimal('Balance', 12, 2)->default(0);
            $table->enum('PaymentStatus', ['Pending', 'Partial', 'Paid', 'Cancelled'])->default('Pending');
            $table->enum('PaymentMethod', ['Cash', 'Card', 'BankTransfer', 'Insurance', 'Other'])->default('Cash');
            $table->text('Notes')->nullable();
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
        Schema::dropIfExists('billings');
    }
};
