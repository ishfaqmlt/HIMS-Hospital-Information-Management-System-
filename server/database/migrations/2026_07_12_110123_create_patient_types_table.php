<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('patientType', ['General', 'IPD','Emergency','Insurance','Telemedicine','Home Visit']);
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_types');
    }
};
