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
        Schema::table('opd_symptoms', function (Blueprint $table) {
            $table->foreignUuid('symptomId')
                ->nullable()
                ->after('visitId')
                ->references('id')
                ->on('master_symptoms')
                ->cascadeOnDelete();

            $table->dropColumn('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('opd_symptoms', function (Blueprint $table) {
            $table->string('name', 191)->nullable()->after('visitId');
            $table->dropForeign(['symptomId']);
            $table->dropColumn('symptomId');
        });
    }
};
