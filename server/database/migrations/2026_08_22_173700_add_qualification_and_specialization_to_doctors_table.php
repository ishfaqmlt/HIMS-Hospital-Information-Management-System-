<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->string('Qualification', 255)->nullable()->after('RegistrationNo');
            $table->string('Specialization', 255)->nullable()->after('Qualification');
        });
    }

    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropColumn(['Qualification', 'Specialization']);
        });
    }
};
