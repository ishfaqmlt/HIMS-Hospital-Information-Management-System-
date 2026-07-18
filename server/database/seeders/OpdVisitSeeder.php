<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OpdVisit;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Department;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OpdVisitSeeder extends Seeder
{
    public function run(): void
    {
        $patients = Patient::all();
        $doctors = Doctor::where('Name', '!=', 'Self')->get();
        $departments = Department::all();

        if ($patients->isEmpty() || $doctors->isEmpty() || $departments->isEmpty()) {
            return;
        }

        $visitTypes = ['OPD', 'Followup', 'Emergency'];
        $statuses = ['Waiting', 'In Progress', 'Completed', 'Cancelled'];
        $complaints = [
            'Fever for 3 days',
            'Persistent headache',
            'Chest pain',
            'Abdominal pain',
            'Cough and cold',
            'Back pain',
            'Joint pain',
            'Skin rash',
        ];
        $diagnoses = [
            'Viral fever',
            'Migraine',
            'Gastritis',
            'Muscle strain',
            'Common cold',
            'Arthritis',
            'Dermatitis',
            'Tension headache',
        ];

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        OpdVisit::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        for ($i = 0; $i < 20; $i++) {
            $patient = $patients->random();
            $doctor = $doctors->random();
            $department = $departments->random();

            OpdVisit::create([
                'patientId' => $patient->id,
                'DoctorId' => $doctor->id,
                'DepartmentId' => $department->id,
                'VisitDate' => now()->subDays(rand(0, 30)),
                'VisitNo' => 'OPD-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'VisitType' => $visitTypes[array_rand($visitTypes)],
                'ConsultationFee' => rand(500, 2000),
                'ChiefComplaint' => $complaints[array_rand($complaints)],
                'Diagnosis' => $diagnoses[array_rand($diagnoses)],
                'Notes' => 'Follow up required after 1 week',
                'Status' => $statuses[array_rand($statuses)],
                'isPrescriptionGiven' => (bool) rand(0, 1),
                'CreatedBy' => 1,
            ]);
        }

        $this->command->info('OPD Visit seeder completed successfully.');
    }
}
