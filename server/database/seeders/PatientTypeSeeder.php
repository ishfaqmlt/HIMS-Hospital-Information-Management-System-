<?php

namespace Database\Seeders;

use App\Models\PatientType;
use Illuminate\Database\Seeder;

class PatientTypeSeeder extends Seeder
{
    public function run(): void
    {
        $patientTypes = ['OPD Consultation', 'Admission (IPD)','Emergency','Laboratory','Radiology','Pharmacy','Day Care','Vaccination','Health Checkup','Physiotherapy','Dialysis','Procedure'];

        foreach ($patientTypes as $type) {
            PatientType::firstOrCreate(['patientType' => $type]);
        }
    }
}
