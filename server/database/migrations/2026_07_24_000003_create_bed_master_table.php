<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bed_master', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('floorId')->constrained('floor_master');
            $table->foreignUuid('roomWardId')->constrained('rooms_wards_master');
            $table->string('BedNo', 50);
            $table->decimal('Rent', 10, 2)->default(0.00);
            $table->decimal('AcCharges', 10, 2)->default(0.00);
            $table->boolean('isOccupied')->default(false);
            $table->boolean('isFunctional')->default(true);
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bed_master');
    }
};
