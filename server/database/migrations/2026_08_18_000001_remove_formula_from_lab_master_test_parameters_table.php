<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lab_master_test_parameters', function (Blueprint $table) {
            $table->dropColumn('formula');
        });
    }

    public function down(): void
    {
        Schema::table('lab_master_test_parameters', function (Blueprint $table) {
            $table->string('formula')->nullable()->after('resultTemplets');
        });
    }
};
