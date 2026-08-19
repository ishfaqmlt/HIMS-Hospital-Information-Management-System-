<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_short_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('sKey', 10);
            $table->string('correctedKey', 100);
            $table->boolean('isSynced')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_short_keys');
    }
};
