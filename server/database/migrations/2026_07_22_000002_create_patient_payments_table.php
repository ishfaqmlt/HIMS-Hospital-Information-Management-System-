<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_payments', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->string('mrn', 50)->constrained('patient_visits', 'mrn')->onDelete('cascade');
            $table->string('invoiceNo', 20)->constrained('billings', 'InvoiceNo')->onDelete('cascade');
            $table->decimal('debit', 10, 2)->default(0);
            $table->decimal('credit', 10, 2)->default(0);
            $table->string('remarks')->nullable();
            $table->foreignId('createdBy')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_payments');
    }
};
