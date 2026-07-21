<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared('ALTER TABLE patient_visits DROP FOREIGN KEY patient_visits_visittypeid_foreign');
        DB::unprepared('ALTER TABLE patient_visits CHANGE visittypeId patientTypeId VARCHAR(36) NOT NULL');
        DB::unprepared('ALTER TABLE patient_visits DROP COLUMN employeeId');
        DB::unprepared('ALTER TABLE patient_visits ADD CONSTRAINT patient_visits_patienttypeid_foreign FOREIGN KEY (patientTypeId) REFERENCES patient_types(id) ON DELETE CASCADE');
    }

    public function down(): void
    {
        DB::unprepared('ALTER TABLE patient_visits DROP FOREIGN KEY patient_visits_patienttypeid_foreign');
        DB::unprepared('ALTER TABLE patient_visits CHANGE patientTypeId visittypeId VARCHAR(36) NOT NULL');
        DB::unprepared('ALTER TABLE patient_visits ADD COLUMN employeeId VARCHAR(36) NULL');
        DB::unprepared('ALTER TABLE patient_visits ADD CONSTRAINT patient_visits_visittypeid_foreign FOREIGN KEY (visittypeId) REFERENCES visit_types(id) ON DELETE CASCADE');
        DB::unprepared('ALTER TABLE patient_visits ADD CONSTRAINT employeeId FOREIGN KEY (employeeId) REFERENCES doctors(id)');
    }
};
