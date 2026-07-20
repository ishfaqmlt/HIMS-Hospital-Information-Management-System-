<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insurance_companies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255)->unique();
            $table->string('phone', 20)->nullable();
            $table->string('contactPerson', 100)->nullable();
            $table->string('mobile', 20)->nullable();
            $table->string('email', 50)->nullable();
            $table->string('address', 255)->nullable();
            $table->boolean('isCredit')->default(false);
            $table->integer('validityHours')->default(48);
            $table->decimal('discount', 5, 2)->nullable();
            $table->boolean('isActive')->default(true);
            $table->timestamp('CreatedAt')->nullable();
            $table->timestamp('UpdatedAt')->nullable();
            $table->boolean('isSynced')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurance_companies');
    }
};
