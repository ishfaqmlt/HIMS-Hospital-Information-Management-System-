<?php

namespace Database\Seeders;

use App\Models\PatientType;
use Illuminate\Database\Seeder;

class PatientTypeSeeder extends Seeder
{
    public function run(): void
    {
        $patientTypes = ['General', 'IPD','Emergency','Insurance','Telemedicine','Home Visit'];

        foreach ($patientTypes as $type) {
            PatientType::firstOrCreate(['patientType' => $type]);
        }
    }
}
