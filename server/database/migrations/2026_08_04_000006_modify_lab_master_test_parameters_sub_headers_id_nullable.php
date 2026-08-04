<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lab_master_test_parameters', function (Blueprint $table) {
            $table->foreignUuid('sub_headers_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('lab_master_test_parameters', function (Blueprint $table) {
            $table->foreignUuid('sub_headers_id')->nullable(false)->change();
        });
    }
};
