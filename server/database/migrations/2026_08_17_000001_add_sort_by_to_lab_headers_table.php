<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lab_headers', function (Blueprint $table) {
            $table->integer('sortBy')->default(0)->after('header_name');
        });
    }

    public function down(): void
    {
        Schema::table('lab_headers', function (Blueprint $table) {
            $table->dropColumn('sortBy');
        });
    }
};
