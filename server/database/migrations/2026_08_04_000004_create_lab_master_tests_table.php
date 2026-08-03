<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_master_tests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('testCode')->unique();
            $table->string('testName')->unique();
            $table->foreignUuid('lab_required_sample_id')->nullable()->constrained('lab_required_samples');
            $table->integer('testSort')->default(1);
            $table->string('expectedTime')->default('60')->nullable();
            $table->text('interpretation')->nullable();
            $table->boolean('isActive')->default(true);
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_master_tests');
    }
};
