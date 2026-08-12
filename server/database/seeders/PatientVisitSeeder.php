<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PatientVisit;
use App\Models\Patient;
use App\Models\Doctor;
use Illuminate\Support\Facades\DB;

class PatientVisitSeeder extends Seeder
{
    public function run(): void
    {
        $patients = Patient::all();
        $doctors = Doctor::where('Name', '!=', 'Self')->get();

        if ($patients->isEmpty()) {
            return;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        PatientVisit::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $statuses = ['Waiting', 'In Progress', 'Completed', 'Cancelled'];

        for ($i = 0; $i < 15; $i++) {
            $patient = $patients->random();
            $doctor = $doctors->isNotEmpty() ? $doctors->random() : null;

            PatientVisit::create([
                'patientId' => $patient->id,
                'doctorId' => $doctor?->id,
                'userId' => 1,
                'visitDate' => now()->subDays(rand(0, 30)),
                'status' => $statuses[array_rand($statuses)],
            ]);
        }

        $this->command->info('Patient Visit seeder completed successfully.');
    }
}
