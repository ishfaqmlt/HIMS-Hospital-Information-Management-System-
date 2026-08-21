<?php

namespace Database\Seeders;

use App\Models\Doctor;
use App\Models\User;
use Illuminate\Database\Seeder;

class DoctorSeeder extends Seeder
{
    public function run(): void
    {
        $doctorUser = User::where('email', 'doctor@hims.com')->first();

        Doctor::firstOrCreate(
            ['Name' => 'Qazi Waleed Hussain'],
            [
                'Name' => 'Qazi Waleed Hussain',
                'Gender' => 'Male',
                'EmployeementStatus' => 'Active',
                'Opd' => true,
            ]
        );

        $abdulQayyum = Doctor::firstOrCreate(
            ['Name' => 'Abdul Qayyum Malik'],
            [
                'Name' => 'Abdul Qayyum Malik',
                'Email' => 'doctor@hims.com',
                'Gender' => 'Male',
                'EmployeementStatus' => 'Active',
                'Opd' => true,
                'user_id' => $doctorUser ? $doctorUser->id : null,
            ]
        );

        if ($doctorUser && !$abdulQayyum->user_id) {
            $abdulQayyum->update([
                'user_id' => $doctorUser->id,
                'Email' => 'doctor@hims.com',
            ]);
        }

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
