<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pharmacy_medicines', function (Blueprint $table) {
            if (Schema::hasColumn('pharmacy_medicines', 'strength')) {
                $table->dropColumn('strength');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pharmacy_medicines', function (Blueprint $table) {
            $table->string('strength', 100)->nullable();
        });
    }
};
