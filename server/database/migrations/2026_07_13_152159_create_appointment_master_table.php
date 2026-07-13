<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('appointment_master', function (Blueprint $table) {
            $table->uuid('Id')->primary();
            $table->foreignUuid('DoctorId')->constrained('doctors')->cascadeOnDelete();
            $table->enum('DayOfWeek', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
            $table->time('StartTime');
            $table->time('EndTime');
            $table->integer('SlotTime');
            $table->enum('BookingType', ['same day', 'advance'])->default('same day');
            $table->integer('SilentSlots')->default(0);
            $table->integer('MaxBookings')->default(0);
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_master');
    }
};
