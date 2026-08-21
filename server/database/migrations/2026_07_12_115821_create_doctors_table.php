<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('Name', 100)->nullable();
            $table->enum('Gender', ['Male', 'Female', 'Other'])->nullable();
            $table->date('Dob')->nullable();
            $table->string('Email', 50)->nullable();
            $table->string('Phone', 20)->nullable();
            $table->string('Cnic', 20)->nullable();
            $table->string('RegistrationNo', 50)->nullable();
            $table->text('Address')->nullable();
            $table->date('JoiningDate')->nullable();
            $table->enum('EmployeementStatus', ['Active', 'Resigned', 'Terminated', 'Retired'])->default('Active');
            $table->text('Stamp')->nullable();
            $table->boolean('Opd')->default(false);
            $table->boolean('Surgeon')->default(false);
            $table->boolean('Anesthetist')->default(false);
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
