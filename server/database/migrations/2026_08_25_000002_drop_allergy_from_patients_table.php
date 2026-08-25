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
        if (Schema::hasColumn('patients', 'allergy')) {
            Schema::table('patients', function (Blueprint $table) {
                $table->dropColumn('allergy');
            });
        }
        if (Schema::hasColumn('patients', 'allergies')) {
            Schema::table('patients', function (Blueprint $table) {
                $table->dropColumn('allergies');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->text('allergy')->nullable();
        });
    }
};
