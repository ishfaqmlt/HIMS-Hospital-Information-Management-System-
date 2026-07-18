<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LabTest;
use App\Models\Department;
use Illuminate\Support\Facades\DB;

class LabTestSeeder extends Seeder
{
    public function run(): void
    {
        $labDept = Department::where('DepartmentName', 'Laboratory')->first();

        $tests = [
            ['TestCode' => 'LAB-001', 'TestName' => 'Complete Blood Count (CBC)', 'Category' => 'Hematology', 'Price' => 500, 'NormalRange' => 'WBC: 4000-11000, RBC: 4.5-5.5, Hb: 12-16', 'Unit' => 'cells/μL'],
            ['TestCode' => 'LAB-002', 'TestName' => 'Blood Sugar Fasting', 'Category' => 'Biochemistry', 'Price' => 200, 'NormalRange' => '70-100 mg/dL', 'Unit' => 'mg/dL'],
            ['TestCode' => 'LAB-003', 'TestName' => 'Blood Sugar Random', 'Category' => 'Biochemistry', 'Price' => 200, 'NormalRange' => '70-140 mg/dL', 'Unit' => 'mg/dL'],
            ['TestCode' => 'LAB-004', 'TestName' => 'HbA1c', 'Category' => 'Biochemistry', 'Price' => 800, 'NormalRange' => '< 5.7%', 'Unit' => '%'],
            ['TestCode' => 'LAB-005', 'TestName' => 'Lipid Profile', 'Category' => 'Biochemistry', 'Price' => 600, 'NormalRange' => 'Total Cholesterol: < 200, LDL: < 100, HDL: > 40', 'Unit' => 'mg/dL'],
            ['TestCode' => 'LAB-006', 'TestName' => 'Liver Function Test (LFT)', 'Category' => 'Biochemistry', 'Price' => 700, 'NormalRange' => 'SGOT: 5-40, SGPT: 7-56, Bilirubin: 0.1-1.2', 'Unit' => 'U/L'],
            ['TestCode' => 'LAB-007', 'TestName' => 'Kidney Function Test (KFT)', 'Category' => 'Biochemistry', 'Price' => 600, 'NormalRange' => 'Urea: 10-50, Creatinine: 0.7-1.3', 'Unit' => 'mg/dL'],
            ['TestCode' => 'LAB-008', 'TestName' => 'Thyroid Profile (TSH, T3, T4)', 'Category' => 'Endocrinology', 'Price' => 900, 'NormalRange' => 'TSH: 0.4-4.0, T3: 80-200, T4: 5-12', 'Unit' => 'mIU/L'],
            ['TestCode' => 'LAB-009', 'TestName' => 'Urinalysis', 'Category' => 'Urinalysis', 'Price' => 150, 'NormalRange' => 'Color: Yellow,透明, pH: 4.5-8.0', 'Unit' => '-'],
            ['TestCode' => 'LAB-010', 'TestName' => 'Stool Routine', 'Category' => 'Stool', 'Price' => 150, 'NormalRange' => 'Color: Brown, consistency: formed', 'Unit' => '-'],
            ['TestCode' => 'LAB-011', 'TestName' => 'ESR', 'Category' => 'Hematology', 'Price' => 100, 'NormalRange' => 'Male: 0-15, Female: 0-20', 'Unit' => 'mm/hr'],
            ['TestCode' => 'LAB-012', 'TestName' => 'Hemoglobin', 'Category' => 'Hematology', 'Price' => 100, 'NormalRange' => 'Male: 13-17, Female: 12-15', 'Unit' => 'g/dL'],
            ['TestCode' => 'LAB-013', 'TestName' => 'Platelet Count', 'Category' => 'Hematology', 'Price' => 150, 'NormalRange' => '150,000-400,000', 'Unit' => 'cells/μL'],
            ['TestCode' => 'LAB-014', 'TestName' => 'INR', 'Category' => 'Coagulation', 'Price' => 400, 'NormalRange' => '0.8-1.2', 'Unit' => '-'],
            ['TestCode' => 'LAB-015', 'TestName' => 'Prothrombin Time (PT)', 'Category' => 'Coagulation', 'Price' => 350, 'NormalRange' => '11-13.5 seconds', 'Unit' => 'sec'],
        ];

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        LabTest::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        foreach ($tests as $test) {
            LabTest::create(array_merge($test, [
                'DepartmentId' => $labDept?->id,
                'isActive' => true,
                'CreatedBy' => 1,
            ]));
        }

        $this->command->info('Lab Test seeder completed successfully.');
    }
}
