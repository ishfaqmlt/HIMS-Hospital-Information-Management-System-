<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pharmacy_suppliers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 150);
            $table->string('contact_person', 100)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('mobile', 50)->nullable();
            $table->string('email', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 50)->nullable();
            $table->string('ntn_number', 50)->nullable();
            $table->string('strn_number', 50)->nullable();
            $table->string('drug_license_no', 50)->nullable();
            $table->decimal('opening_balance', 12, 2)->default(0.00);
            $table->decimal('current_balance', 12, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pharmacy_suppliers');
    }
};
