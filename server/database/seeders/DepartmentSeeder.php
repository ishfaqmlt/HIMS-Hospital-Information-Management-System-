<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['DepartmentName' => 'OPD', 'ServingBy' => 'Doctor', 'isActive' => true],
            ['DepartmentName' => 'ECG', 'ServingBy' => 'Department', 'isActive' => true],
            ['DepartmentName' => 'Indoor', 'ServingBy' => 'Department', 'isActive' => true],
            ['DepartmentName' => 'Emergency', 'ServingBy' => 'Department', 'isActive' => true],
            ['DepartmentName' => 'ICU', 'ServingBy' => 'Doctor', 'isActive' => true],
            ['DepartmentName' => 'Laboratory', 'ServingBy' => 'Department', 'isActive' => true],
            ['DepartmentName' => 'X-Ray', 'ServingBy' => 'Department', 'isActive' => true],
            ['DepartmentName' => 'Ultrasound', 'ServingBy' => 'Doctor', 'isActive' => true],
            ['DepartmentName' => 'CT Scan', 'ServingBy' => 'Department', 'isActive' => true],
            ['DepartmentName' => 'MRI', 'ServingBy' => 'Department', 'isActive' => true],
            ['DepartmentName' => 'Pharmacy', 'ServingBy' => 'Department', 'isActive' => false],
            ['DepartmentName' => 'Nursing and paramedics', 'ServingBy' => 'Department', 'isActive' => true],
            ['DepartmentName' => 'Operation Theatre (OT)', 'ServingBy' => 'Department', 'isActive' => true],
        ];

        foreach ($departments as $dept) {
            Department::firstOrCreate(
                ['DepartmentName' => $dept['DepartmentName']],
                $dept
            );
        }
    }
}
