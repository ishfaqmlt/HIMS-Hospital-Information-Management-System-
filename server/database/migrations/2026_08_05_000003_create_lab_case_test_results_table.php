<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_case_test_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('caseTestId')->constrained('lab_case_tests')->onDelete('cascade');
            $table->foreignUuid('parameterId')->constrained('lab_master_test_parameters');
            $table->string('result')->nullable();
            $table->string('units')->nullable();
            $table->enum('paramStatus', ['N', 'A', 'C'])->default('N');
            $table->boolean('isPrint')->default(false);
            $table->string('normalRange')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_case_test_results');
    }
};
