<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_analyzer_data', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('analyzerId')->nullable()->constrained('lab_analyzers')->onDelete('cascade');
            $table->string('caseNo', 50)->index();
            $table->dateTime('tdate')->nullable();
            $table->string('paramName', 100);
            $table->string('result', 100)->nullable();
            $table->string('unit', 50)->nullable();
            $table->string('flag', 20)->nullable();
            $table->boolean('isSynced')->default(false)->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_analyzer_data');
    }
};
