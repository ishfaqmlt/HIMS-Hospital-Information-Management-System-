<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::dropIfExists('lab_case_test_results');
        Schema::dropIfExists('lab_boundings');
        Schema::dropIfExists('lab_master_test_parameters');
        Schema::dropIfExists('lab_case_tests');
        Schema::dropIfExists('lab_master_tests');

        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        Schema::create('lab_master_tests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('serviceId')->constrained('services')->onDelete('cascade');
            $table->uuid('lab_required_sample_id')->nullable();
            $table->integer('testSort')->default(1);
            $table->string('expectedTime')->default('60')->nullable();
            $table->text('interpretation')->nullable();
            $table->boolean('isActive')->default(true);
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });

        Schema::create('lab_case_tests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('caseId')->constrained('lab_cases')->onDelete('cascade');
            $table->foreignUuid('masterTestId')->constrained('lab_master_tests');
            $table->string('serviceId')->nullable();
            $table->decimal('rate', 10, 2)->default(0);
            $table->enum('testStatus', ['Registered', 'Sampled', 'InProcess', 'Reported', 'Approved', 'Cancelled'])->default('Registered');
            $table->enum('sampleStatus', ['Accepted', 'Rejected'])->nullable();
            $table->string('rejectReason', 100)->nullable();
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

        Schema::create('lab_master_test_parameters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('master_test_id')->constrained('lab_master_tests')->onDelete('cascade');
            $table->uuid('sub_headers_id')->nullable();
            $table->string('parameterName');
            $table->string('defaultValue')->nullable();
            $table->string('units')->nullable();
            $table->integer('decimal')->default(0);
            $table->string('resultTemplets')->nullable();
            $table->string('formula')->nullable();
            $table->string('analyzerCode')->nullable();
            $table->integer('sortNo')->default(0);
            $table->boolean('printOnReciept')->default(true);
            $table->boolean('isActive')->default(true);
            $table->text('normalRange')->nullable();
            $table->boolean('isSynced')->default(false);
            $table->timestamps();
        });

        Schema::create('lab_boundings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('parameterId')->constrained('lab_master_test_parameters')->onDelete('cascade');
            $table->string('boundingName')->nullable();
            $table->string('gender')->nullable();
            $table->integer('ageFrom')->nullable();
            $table->integer('ageTo')->nullable();
            $table->string('ageType')->nullable();
            $table->string('dayFrom')->nullable();
            $table->string('dayTo')->nullable();
            $table->string('normalRangeLow')->nullable();
            $table->string('normalRangeHigh')->nullable();
            $table->text('interpretation')->nullable();
            $table->boolean('isActive')->default(true);
            $table->timestamps();
        });

        Schema::create('lab_case_test_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('caseTestId')->constrained('lab_case_tests')->onDelete('cascade');
            $table->foreignUuid('parameterId')->constrained('lab_master_test_parameters');
            $table->string('result')->nullable();
            $table->string('units')->nullable();
            $table->enum('paramStatus', ['N', 'A', 'C'])->default('N');
            $table->string('normalRange')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('lab_case_test_results');
        Schema::dropIfExists('lab_boundings');
        Schema::dropIfExists('lab_master_test_parameters');
        Schema::dropIfExists('lab_case_tests');
        Schema::dropIfExists('lab_master_tests');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
