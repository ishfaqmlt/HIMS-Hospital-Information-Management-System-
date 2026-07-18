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
        Schema::create('pharmacy_items', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->string('ItemCode', 20);
            $table->string('ItemName', 100);
            $table->string('Category', 50)->nullable();
            $table->string('Manufacturer', 100)->nullable();
            $table->string('Unit', 20)->default('piece');
            $table->decimal('PurchasePrice', 10, 2)->default(0);
            $table->decimal('SellingPrice', 10, 2)->default(0);
            $table->integer('StockQuantity')->default(0);
            $table->integer('ReorderLevel')->default(10);
            $table->date('ExpiryDate')->nullable();
            $table->string('BatchNo', 50)->nullable();
            $table->boolean('isActive')->default(true);
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
        Schema::dropIfExists('pharmacy_items');
    }
};
