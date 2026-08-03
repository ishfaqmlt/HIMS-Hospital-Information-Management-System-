<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patient_payments', function (Blueprint $table) {
            $table->enum('payerType', ['Patient', 'Insurance'])->default('Patient')->after('credit');
            $table->foreignUuid('insuranceCompanyId')->nullable()->after('payerType')->constrained('insurance_companies')->nullOnDelete();
            $table->enum('status', ['Active', 'Cancelled'])->default('Active')->after('insuranceCompanyId');
        });
    }

    public function down(): void
    {
        Schema::table('patient_payments', function (Blueprint $table) {
            $table->dropColumn(['payerType', 'insuranceCompanyId', 'status']);
        });
    }
};
