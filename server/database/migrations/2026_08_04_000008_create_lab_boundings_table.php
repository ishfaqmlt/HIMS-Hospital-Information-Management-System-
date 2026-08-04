<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_boundings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('parameterId')->constrained('lab_master_test_parameters')->onDelete('cascade');
            $table->string('gender')->nullable();
            $table->integer('fromAge')->default(0);
            $table->integer('toAge')->default(0);
            $table->string('ageType')->default('Years');
            $table->double('lowerBound')->default(0);
            $table->double('upperBound')->default(0);
            $table->double('lowerCritical')->default(0);
            $table->double('upperCritical')->default(0);
            $table->integer('fromAgeDays')->default(0);
            $table->integer('toAgeDays')->default(0);
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_boundings');
    }
};
