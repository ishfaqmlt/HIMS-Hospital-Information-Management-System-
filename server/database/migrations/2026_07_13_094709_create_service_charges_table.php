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
        Schema::create('service_charges', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->foreignUuid('doctorId')->constrained('doctors')->cascadeOnDelete();
            $table->foreignUuid('ServiceId')->constrained('services')->cascadeOnDelete();
            $table->foreignUuid('departmentId')->constrained('departments')->cascadeOnDelete();
            $table->decimal('Charges', 10, 2)->default(0.00);
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_charges');
    }
};
