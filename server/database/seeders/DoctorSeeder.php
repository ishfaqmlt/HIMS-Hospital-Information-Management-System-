<?php

namespace Database\Seeders;

use App\Models\Doctor;
use Illuminate\Database\Seeder;

class DoctorSeeder extends Seeder
{
    public function run(): void
    {
        Doctor::firstOrCreate(
            ['Name' => 'Self'],
            [
                'Name' => 'Self',
                'Gender' => 'Male',
                'EmployeementStatus' => 'Active',
                'Opd' => true,
            ]
        );
    }
}
