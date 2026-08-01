<?php

namespace Database\Seeders;

use App\Models\Doctor;
use Illuminate\Database\Seeder;

class DoctorSeeder extends Seeder
{
    public function run(): void
    {
        Doctor::firstOrCreate(
            ['Name' => 'Qazi Waleed Hussain'],
            [
                'Name' => 'Qazi Waleed Hussain',
                'Gender' => 'Male',
                'EmployeementStatus' => 'Active',
                'Opd' => true,
            ]
           
        );

        Doctor::firstOrCreate(
            ['Name' => 'Abdul Qayyum Malik'],
            [
                'Name' => 'Abdul Qayyum Malik',
                'Gender' => 'Male',
                'EmployeementStatus' => 'Active',
                'Opd' => true,
            ]
        );

        Doctor::firstOrCreate(
            ['Name' => 'Zahida Qayyum Malik'],
            [
                'Name' => 'Zahida Qayyum Malik',
                'Gender' => 'Female',
                'EmployeementStatus' => 'Active',
                'Opd' => true,
            ]
        );

        Doctor::firstOrCreate(
            ['Name' => 'Syed Fazal Hussain Shah'],
            [
                'Name' => 'Syed Fazal Hussain Shah',
                'Gender' => 'Male',
                'EmployeementStatus' => 'Active',
                'Opd' => true,
            ]
        );
    }
}
