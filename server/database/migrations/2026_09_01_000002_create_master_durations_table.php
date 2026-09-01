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
        Schema::create('master_durations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('duration', 191);
            $table->boolean('isSynced')->default(false);
            $table->boolean('isActive')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_durations');
    }
};
