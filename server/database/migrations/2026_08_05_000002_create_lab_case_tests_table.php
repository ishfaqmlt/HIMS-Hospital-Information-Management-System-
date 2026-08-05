<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_case_tests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('caseId')->constrained('lab_cases')->onDelete('cascade');
            $table->foreignUuid('masterTestId')->constrained('lab_master_tests');
            $table->string('serviceId')->nullable();
            $table->decimal('rate', 10, 2)->default(0);
            $table->enum('status', ['Pending', 'Sampled', 'InProcess', 'Completed', 'Approved', 'Cancelled'])->default('Pending');
            $table->dateTime('sampledAt')->nullable();
            $table->foreignId('sampledBy')->nullable()->constrained('users');
            $table->boolean('isPerformed')->default(false);
            $table->foreignId('performedBy')->nullable()->constrained('users');
            $table->dateTime('performedAt')->nullable();
            $table->boolean('isApproved')->default(false);
            $table->foreignId('approvedBy')->nullable()->constrained('users');
            $table->dateTime('approvedAt')->nullable();
            $table->boolean('showInterpretation')->default(false);
            $table->boolean('isPrinted')->default(false);
            $table->dateTime('printedAt')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_case_tests');
    }
};
