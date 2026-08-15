<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE billings MODIFY COLUMN PaymentStatus ENUM('Pending', 'Partial', 'Paid', 'Cancelled', 'Returned') NOT NULL DEFAULT 'Pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE billings MODIFY COLUMN PaymentStatus ENUM('Pending', 'Partial', 'Paid', 'Cancelled') NOT NULL DEFAULT 'Pending'");
    }
};
