<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_master_test_parameters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('master_test_id')->constrained('lab_master_tests')->onDelete('cascade');
            $table->foreignUuid('sub_headers_id')->nullable()->constrained('lab_sub_headers')->onDelete('set null');
            $table->string('parameterName');
            $table->string('defaultValue')->nullable();
            $table->string('units')->nullable();
            $table->integer('decimal')->default(0);
            $table->string('resultTemplets')->nullable();
            $table->string('formula')->nullable();
            $table->string('analyzerCode')->nullable();
            $table->integer('sortNo')->default(0);
            $table->boolean('printOnReciept')->default(true);
            $table->boolean('isActive')->default(true);
            $table->text('normalRange')->nullable();
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_master_test_parameters');
    }
};
