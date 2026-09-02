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
        Schema::table('opd_medications', function (Blueprint $table) {
            $table->dropForeign(['frequencyId']);
            $table->dropForeign(['durationId']);
            $table->dropForeign(['instructionId']);
            $table->dropColumn(['frequencyId', 'durationId', 'instructionId']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('opd_medications', function (Blueprint $table) {
            $table->foreignUuid('frequencyId')->nullable()->references('id')->on('master_frequency')->nullOnDelete();
            $table->foreignUuid('durationId')->nullable()->references('id')->on('master_durations')->nullOnDelete();
            $table->foreignUuid('instructionId')->nullable()->references('id')->on('master_instructions')->nullOnDelete();
        });
    }
};
