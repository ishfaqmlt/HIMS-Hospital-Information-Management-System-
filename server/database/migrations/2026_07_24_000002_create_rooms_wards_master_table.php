<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms_wards_master', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('floorId')->constrained('floor_master')->onDelete('cascade');
            $table->enum('RoomWardType', ['Private Room', 'Ward']);
            $table->string('RoomWardName', 100);
            $table->boolean('isFunctional')->default(true);
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms_wards_master');
    }
};
