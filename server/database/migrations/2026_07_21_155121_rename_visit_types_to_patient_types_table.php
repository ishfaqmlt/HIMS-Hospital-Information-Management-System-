<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::rename('visit_types', 'patient_types');
    }

    public function down(): void
    {
        Schema::rename('patient_types', 'visit_types');
    }
};
