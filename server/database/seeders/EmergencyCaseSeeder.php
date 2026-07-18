<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmergencyCase;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Department;
use Illuminate\Support\Facades\DB;

class EmergencyCaseSeeder extends Seeder
{
    public function run(): void
    {
        $patients = Patient::all();
        $doctors = Doctor::where('Name', '!=', 'Self')->get();
        $departments = Department::all();

        if ($patients->isEmpty() || $doctors->isEmpty() || $departments->isEmpty()) {
            return;
        }

        $priorities = ['Critical', 'Urgent', 'Standard'];
        $statuses = ['Active', 'Discharged', 'Transferred', 'Deceased', 'Cancelled'];
        $complaints = [
            'Road traffic accident',
            'Severe allergic reaction',
            'Chest pain and difficulty breathing',
            'Unconscious patient brought in',
            'Severe bleeding from wound',
            'Drug overdose',
            'Fall from height',
            'Burns from fire',
        ];
        $diagnoses = [
            'Multiple fractures',
            'Anaphylaxis',
            'Acute myocardial infarction',
            'Unresponsive - cause unknown',
            'Laceration with significant blood loss',
            'Toxic ingestion',
            'Spinal injury',
            'Second-degree burns',
        ];

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        EmergencyCase::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        for ($i = 0; $i < 10; $i++) {
            $patient = $patients->random();
            $doctor = $doctors->random();
            $department = $departments->random();
            $charges = rand(2000, 30000);
            $paid = rand(0, $charges);

            EmergencyCase::create([
                'patientId' => $patient->id,
                'DoctorId' => $doctor->id,
                'DepartmentId' => $department->id,
                'CaseNo' => 'EMG-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'ArrivalDate' => now()->subDays(rand(0, 14)),
                'DischargeDate' => rand(0, 1) ? now()->subDays(rand(0, 3)) : null,
                'Priority' => $priorities[array_rand($priorities)],
                'Status' => $statuses[array_rand($statuses)],
                'ChiefComplaint' => $complaints[array_rand($complaints)],
                'Diagnosis' => $diagnoses[array_rand($diagnoses)],
                'Treatment' => 'Emergency treatment provided',
                'Notes' => 'Patient stabilized',
                'TotalCharges' => $charges,
                'TotalPaid' => $paid,
                'Balance' => $charges - $paid,
                'CreatedBy' => 1,
            ]);
        }

        $this->command->info('Emergency Case seeder completed successfully.');
    }
}
