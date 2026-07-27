<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            PatientTypeSeeder::class,
            DepartmentSeeder::class,
            DoctorSeeder::class,
            ServiceSeeder::class,
            FloorMasterSeeder::class,
            RoomsWardsMasterSeeder::class,
            BedMasterSeeder::class,
            OpdVisitSeeder::class,
            IpdAdmissionSeeder::class,
            EmergencyCaseSeeder::class,
            BillingSeeder::class,
            PharmacyItemSeeder::class,
            LabTestSeeder::class,
            RadiologyScanSeeder::class,
        ]);
    }
}
