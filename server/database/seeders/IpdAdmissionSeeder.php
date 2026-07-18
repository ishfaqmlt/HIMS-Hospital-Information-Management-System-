<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\IpdAdmission;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Department;
use Illuminate\Support\Facades\DB;

class IpdAdmissionSeeder extends Seeder
{
    public function run(): void
    {
        $patients = Patient::all();
        $doctors = Doctor::where('Name', '!=', 'Self')->get();
        $departments = Department::all();

        if ($patients->isEmpty() || $doctors->isEmpty() || $departments->isEmpty()) {
            return;
        }

        $admissionTypes = ['Elective', 'Emergency', 'Transfer'];
        $statuses = ['Admitted', 'Discharged', 'Transferred', 'Cancelled'];
        $complaints = [
            'Severe abdominal pain',
            'Chest pain with shortness of breath',
            'High fever with dehydration',
            'Post-surgical observation',
            'Cardiac monitoring',
            'Respiratory distress',
        ];
        $diagnoses = [
            'Acute appendicitis',
            'Myocardial infarction',
            'Severe dehydration',
            'Post-operative care',
            'Cardiac arrhythmia',
            'Pneumonia',
        ];

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        IpdAdmission::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        for ($i = 0; $i < 15; $i++) {
            $patient = $patients->random();
            $doctor = $doctors->random();
            $department = $departments->random();
            $charges = rand(5000, 50000);
            $paid = rand(0, $charges);

            IpdAdmission::create([
                'patientId' => $patient->id,
                'DoctorId' => $doctor->id,
                'DepartmentId' => $department->id,
                'AdmissionNo' => 'IPD-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'AdmissionDate' => now()->subDays(rand(0, 30)),
                'DischargeDate' => rand(0, 1) ? now()->subDays(rand(0, 5)) : null,
                'RoomNo' => 'R-' . rand(100, 500),
                'BedNo' => 'B-' . rand(1, 10),
                'AdmissionType' => $admissionTypes[array_rand($admissionTypes)],
                'Status' => $statuses[array_rand($statuses)],
                'ChiefComplaint' => $complaints[array_rand($complaints)],
                'Diagnosis' => $diagnoses[array_rand($diagnoses)],
                'TreatmentPlan' => 'Medication and monitoring',
                'DischargeSummary' => null,
                'TotalCharges' => $charges,
                'TotalPaid' => $paid,
                'Balance' => $charges - $paid,
                'CreatedBy' => 1,
            ]);
        }

        $this->command->info('IPD Admission seeder completed successfully.');
    }
}
