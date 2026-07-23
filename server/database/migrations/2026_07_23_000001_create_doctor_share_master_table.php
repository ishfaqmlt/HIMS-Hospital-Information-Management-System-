<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_share_master', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->foreignUuid('DepartmentId')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignUuid('ServiceId')->nullable()->constrained('services')->onDelete('set null');
            $table->foreignUuid('doctorId')->nullable()->constrained('doctors')->onDelete('set null');
            $table->decimal('DoctorShare', 5, 2);
            $table->decimal('hospitalShare', 5, 2);
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_share_master');
    }
};
