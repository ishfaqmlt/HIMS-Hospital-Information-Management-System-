<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('visitId')->constrained('patient_visits')->cascadeOnDelete();
            $table->foreignUuid('billingId')->nullable()->constrained('billings')->nullOnDelete();
            $table->string('invoiceNo', 20);
            $table->decimal('debit', 12, 2)->default(0);
            $table->decimal('credit', 12, 2)->default(0);
            $table->string('paymentMode', 50)->nullable();
            $table->string('remarks')->nullable();
            $table->foreignId('createdBy')->constrained('users');
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_payments');
    }
};
