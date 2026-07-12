<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('Code', 10)->nullable();
            $table->uuid('DepartmentId');
            $table->string('ServiceName', 50);
            $table->decimal('DefaultCharges', 10, 2)->default(0);
            $table->boolean('isActive')->default(true);
            $table->boolean('printToken')->default(false);
            $table->boolean('isSynced')->default(false);
            $table->timestamps();

            $table->foreign('DepartmentId')->references('id')->on('departments')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
