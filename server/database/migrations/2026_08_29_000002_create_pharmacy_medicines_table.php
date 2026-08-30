<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pharmacy_medicines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('item_code', 50)->unique();
            $table->string('barcode', 100)->nullable()->index();
            $table->string('brand_name', 200);
            $table->foreignUuid('generic_id')->nullable()->constrained('pharmacy_generics')->nullOnDelete();
            $table->foreignUuid('category_id')->nullable()->constrained('pharmacy_categories')->nullOnDelete();
            $table->foreignUuid('dosage_form_id')->nullable()->constrained('pharmacy_dosage_forms')->nullOnDelete();
            $table->foreignUuid('manufacturer_id')->nullable()->constrained('pharmacy_manufacturers')->nullOnDelete();
            $table->foreignUuid('purchase_unit_id')->nullable()->constrained('pharmacy_units')->nullOnDelete();
            $table->foreignUuid('sale_unit_id')->nullable()->constrained('pharmacy_units')->nullOnDelete();
            $table->integer('unit_conversion')->default(1);
            $table->decimal('purchase_price', 12, 2)->default(0.00);
            $table->decimal('sale_price', 12, 2)->default(0.00);
            $table->decimal('mrp', 12, 2)->default(0.00);
            $table->decimal('tax_percent', 5, 2)->default(0.00);
            $table->decimal('discount_percent', 5, 2)->default(0.00);
            $table->integer('min_reorder_level')->default(10);
            $table->integer('max_stock_level')->nullable();
            $table->string('rack_location', 50)->nullable();
            $table->boolean('requires_prescription')->default(false);
            $table->boolean('is_narcotic')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pharmacy_medicines');
    }
};
