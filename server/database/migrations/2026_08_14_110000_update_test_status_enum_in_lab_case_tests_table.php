<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE lab_case_tests MODIFY COLUMN testStatus ENUM('Registered', 'Pending', 'Sampled', 'InProcess', 'Reported', 'Completed', 'Approved', 'Cancelled') NOT NULL DEFAULT 'Registered'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE lab_case_tests MODIFY COLUMN testStatus ENUM('Pending', 'Sampled', 'InProcess', 'Reported', 'Completed', 'Approved', 'Cancelled') NOT NULL DEFAULT 'Pending'");
    }
};
