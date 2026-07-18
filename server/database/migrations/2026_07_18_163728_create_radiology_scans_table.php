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
        Schema::create('radiology_scans', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->string('ScanCode', 20);
            $table->string('ScanName', 100);
            $table->string('Category', 50)->nullable();
            $table->foreignUuid('DepartmentId')->nullable()->constrained('departments')->nullOnDelete();
            $table->decimal('Price', 10, 2)->default(0);
            $table->text('Description')->nullable();
            $table->text('PreparationNotes')->nullable();
            $table->integer('DurationMinutes')->default(30);
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
        Schema::dropIfExists('radiology_scans');
    }
};
