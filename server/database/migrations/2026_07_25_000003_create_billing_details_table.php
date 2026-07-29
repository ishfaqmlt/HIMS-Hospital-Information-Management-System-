<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billing_details', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->string('invoiceNo', 20)->constrained('billings', 'InvoiceNo')->onDelete('cascade');
            $table->foreignUuid('serviceId')->constrained('services')->onDelete('cascade');
            $table->integer('Qty')->default(1);
            $table->decimal('Rate', 10, 2)->default(0);
            $table->decimal('Amount', 10, 2)->default(0);
            $table->decimal('SharePercent', 5, 2)->default(0);
            $table->decimal('ShareAmount', 10, 2)->default(0);
            $table->boolean('isServed')->default(false);
            $table->foreignId('createdBy')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_details');
    }
};
