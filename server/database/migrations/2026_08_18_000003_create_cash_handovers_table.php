<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_handovers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('handoverNo', 25)->unique();
            $table->foreignId('userId')->constrained('users');
            $table->enum('shiftType', ['Morning', 'Evening', 'Night', 'FullDay'])->default('Morning');
            $table->dateTime('shiftStartDate');
            $table->dateTime('shiftEndDate');
            $table->decimal('openingBalance', 12, 2)->default(0);
            $table->decimal('systemExpectedCash', 12, 2)->default(0);
            $table->decimal('physicalCashCounted', 12, 2)->default(0);
            $table->decimal('cardCollected', 12, 2)->default(0);
            $table->decimal('onlineCollected', 12, 2)->default(0);
            $table->decimal('totalGrossCollected', 12, 2)->default(0);
            $table->decimal('totalRefunded', 12, 2)->default(0);
            $table->decimal('varianceAmount', 12, 2)->default(0);
            $table->enum('varianceType', ['Exact', 'Shortage', 'Excess'])->default('Exact');
            $table->json('denominations')->nullable();
            $table->enum('status', ['Pending', 'Accepted', 'Rejected'])->default('Pending');
            $table->foreignId('acceptedBy')->nullable()->constrained('users');
            $table->dateTime('acceptedAt')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_handovers');
    }
};
