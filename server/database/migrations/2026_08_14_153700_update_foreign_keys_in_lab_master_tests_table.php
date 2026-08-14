<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $defaultHeader = DB::table('lab_headers')->first()?->id;
        $defaultSample = DB::table('lab_required_samples')->first()?->id;

        if ($defaultHeader) {
            DB::table('lab_master_tests')->whereNull('lab_headers_id')->update(['lab_headers_id' => $defaultHeader]);
        }
        if ($defaultSample) {
            DB::table('lab_master_tests')->whereNull('lab_required_sample_id')->update(['lab_required_sample_id' => $defaultSample]);
        }

        try {
            Schema::table('lab_master_tests', function (Blueprint $table) {
                $table->dropForeign(['lab_headers_id']);
            });
        } catch (\Throwable $e) {
            // Foreign key might already be dropped
        }

        try {
            Schema::table('lab_master_tests', function (Blueprint $table) {
                $table->dropForeign(['lab_required_sample_id']);
            });
        } catch (\Throwable $e) {
            // Foreign key might already be dropped
        }

        Schema::table('lab_master_tests', function (Blueprint $table) {
            $table->foreignUuid('lab_headers_id')->nullable(false)->change()->constrained('lab_headers')->onDelete('cascade');
            $table->foreignUuid('lab_required_sample_id')->nullable(false)->change()->constrained('lab_required_samples')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        try {
            Schema::table('lab_master_tests', function (Blueprint $table) {
                $table->dropForeign(['lab_headers_id']);
                $table->dropForeign(['lab_required_sample_id']);
            });
        } catch (\Throwable $e) {}

        Schema::table('lab_master_tests', function (Blueprint $table) {
            $table->foreignUuid('lab_headers_id')->nullable()->change()->constrained('lab_headers')->onDelete('set null');
            $table->uuid('lab_required_sample_id')->nullable()->change();
        });
    }
};
