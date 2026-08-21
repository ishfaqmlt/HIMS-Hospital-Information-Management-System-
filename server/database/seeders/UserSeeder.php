<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $usersData = [
            [
                'name' => 'System Admin',
                'email' => 'admin@hims.com',
                'password' => 'password',
                'role' => 'super_admin',
            ],
            [
                'name' => 'Hospital Admin',
                'email' => 'hadmin@hims.com',
                'password' => 'password',
                'role' => 'admin',
            ],
            [
                'name' => 'Dr. Abdul Qayyum',
                'email' => 'doctor@hims.com',
                'password' => 'password',
                'role' => 'doctor',
            ],
            [
                'name' => 'Nurse Sarah',
                'email' => 'nurse@hims.com',
                'password' => 'password',
                'role' => 'nurse',
            ],
            [
                'name' => 'Receptionist Ali',
                'email' => 'receptionist@hims.com',
                'password' => 'password',
                'role' => 'receptionist',
            ],
            [
                'name' => 'Pharmacist Usman',
                'email' => 'pharmacist@hims.com',
                'password' => 'password',
                'role' => 'pharmacist',
            ],
            [
                'name' => 'Phlebotomist Zain',
                'email' => 'phlebotomist@hims.com',
                'password' => 'password',
                'role' => 'lab_phlebotomist',
            ],
            [
                'name' => 'Lab Tech Tariq',
                'email' => 'labtech@hims.com',
                'password' => 'password',
                'role' => 'lab_technician',
            ],
            [
                'name' => 'Lab Supervisor Bilal',
                'email' => 'labsupervisor@hims.com',
                'password' => 'password',
                'role' => 'lab_supervisor',
            ],
            [
                'name' => 'Pathologist Dr. Rashid',
                'email' => 'pathologist@hims.com',
                'password' => 'password',
                'role' => 'lab_pathologist',
            ],
            [
                'name' => 'Radiographer Kamran',
                'email' => 'radiographer@hims.com',
                'password' => 'password',
                'role' => 'radiographer',
            ],
            [
                'name' => 'Radiologist Dr. Hamza',
                'email' => 'radiologist@hims.com',
                'password' => 'password',
                'role' => 'radiologist',
            ],
            [
                'name' => 'Accountant Imran',
                'email' => 'accountant@hims.com',
                'password' => 'password',
                'role' => 'accountant',
            ],
            [
                'name' => 'HR Manager Fatima',
                'email' => 'hr@hims.com',
                'password' => 'password',
                'role' => 'hr_manager',
            ],
        ];

        foreach ($usersData as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make($data['password']),
                ]
            );

            $role = Role::where('name', $data['role'])->where('guard_name', 'sanctum')->first();
            if ($role && !$user->hasRole($role)) {
                $user->assignRole($role);
            }
        }
    }
}
