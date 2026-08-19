<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_analyzers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('manufacturer', 100)->nullable();
            $table->string('model', 100)->nullable();
            
            // Communication & Protocol Mode
            $table->enum('communicationType', ['TCP', 'SERIAL'])->default('TCP');
            $table->enum('protocol', ['ASTM', 'HL7', 'CUSTOM'])->default('ASTM');
            $table->enum('direction', ['UNIDIRECTIONAL', 'BIDIRECTIONAL'])->default('UNIDIRECTIONAL');

            // TCP / IP Network Settings
            $table->string('host')->nullable();
            $table->unsignedInteger('port')->nullable();

            // Serial Port Settings (RS-232 / COM)
            $table->string('comPort')->nullable();
            $table->unsignedInteger('baudRate')->default(9600)->nullable();
            $table->enum('parity', ['None', 'Even', 'Odd', 'Mark', 'Space'])->default('None')->nullable();
            $table->unsignedInteger('dataBits')->default(8)->nullable();
            $table->float('stopBits')->default(1)->nullable();

            // Status & Logs
            $table->boolean('isActive')->default(true);
            $table->timestamp('lastConnectedAt')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_analyzers');
    }
};
