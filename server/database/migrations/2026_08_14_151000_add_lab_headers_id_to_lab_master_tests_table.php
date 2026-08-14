<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lab_master_tests', function (Blueprint $table) {
            $table->foreignUuid('lab_headers_id')->nullable()->after('serviceId')->constrained('lab_headers')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('lab_master_tests', function (Blueprint $table) {
            $table->dropForeign(['lab_headers_id']);
            $table->dropColumn('lab_headers_id');
        });
    }
};
