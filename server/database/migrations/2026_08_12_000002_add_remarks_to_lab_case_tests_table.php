<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('lab_case_tests')) {
            Schema::table('lab_case_tests', function (Blueprint $table) {
                if (!Schema::hasColumn('lab_case_tests', 'remarks')) {
                    $table->text('remarks')->nullable()->after('approvedAt');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('lab_case_tests')) {
            Schema::table('lab_case_tests', function (Blueprint $table) {
                if (Schema::hasColumn('lab_case_tests', 'remarks')) {
                    $table->dropColumn('remarks');
                }
            });
        }
    }
};
