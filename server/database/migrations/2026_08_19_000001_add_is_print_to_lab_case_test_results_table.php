<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lab_case_test_results', function (Blueprint $table) {
            $table->boolean('isPrint')->default(false)->after('paramStatus');
        });
    }

    public function down(): void
    {
        Schema::table('lab_case_test_results', function (Blueprint $table) {
            $table->dropColumn('isPrint');
        });
    }
};
