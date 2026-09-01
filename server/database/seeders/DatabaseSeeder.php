<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            UserSeeder::class,
            DepartmentSeeder::class,
            DoctorSeeder::class,
            ServiceSeeder::class,
            FloorMasterSeeder::class,
            RoomsWardsMasterSeeder::class,
            BedMasterSeeder::class,
            PatientVisitSeeder::class,
            IpdAdmissionSeeder::class,
            EmergencyCaseSeeder::class,
            BillingSeeder::class,
            RadiologyScanSeeder::class,
            LabHeaderSeeder::class,
            LabSubHeaderSeeder::class,
            LabRequiredSampleSeeder::class,
            LabMasterTestSeeder::class,
            LabMasterTestParameterSeeder::class,
            LabBoundingSeeder::class,
            PharmacyMasterSeeder::class,
            PharmacySupplierSeeder::class,
            PharmacyMedicineSeeder::class,
            MasterFrequencySeeder::class,
            MasterDurationSeeder::class,
            MasterInstructionSeeder::class,
        ]);
    }
}
