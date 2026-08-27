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
        Schema::create('pharmacy_manufacturers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 200)->unique();
            $table->string('contact_number', 50)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('country', 100)->nullable()->default('Pakistan');
            $table->boolean('is_active')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pharmacy_manufacturers');
    }
};
