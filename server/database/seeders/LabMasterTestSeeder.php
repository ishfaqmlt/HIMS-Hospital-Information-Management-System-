<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LabMasterTest;
use App\Models\LabRequiredSample;
use Illuminate\Support\Str;

class LabMasterTestSeeder extends Seeder
{
    public function run(): void
    {
        LabMasterTest::truncate();

        $bloodSample = LabRequiredSample::where('required_sample_name', 'Blood')->first();
        $urineSample = LabRequiredSample::where('required_sample_name', 'Urine')->first();
        $stoolSample = LabRequiredSample::where('required_sample_name', 'Stool')->first();

        $tests = [
            [
                'id' => Str::uuid(),
                'testCode' => 'CBC001',
                'testName' => 'Complete Blood Count',
                'lab_required_sample_id' => $bloodSample?->id,
                'testSort' => 1,
                'expectedTime' => '60',
                'interpretation' => 'Complete blood count with differential',
                'isActive' => true,
            ],
            [
                'id' => Str::uuid(),
                'testCode' => 'LIP001',
                'testName' => 'Lipid Profile',
                'lab_required_sample_id' => $bloodSample?->id,
                'testSort' => 2,
                'expectedTime' => '120',
                'interpretation' => 'Total cholesterol, HDL, LDL, Triglycerides',
                'isActive' => true,
            ],
            [
                'id' => Str::uuid(),
                'testCode' => 'LFT001',
                'testName' => 'Liver Function Test',
                'lab_required_sample_id' => $bloodSample?->id,
                'testSort' => 3,
                'expectedTime' => '120',
                'interpretation' => 'SGPT, SGOT, ALP, Bilirubin',
                'isActive' => true,
            ],
            [
                'id' => Str::uuid(),
                'testCode' => 'KFT001',
                'testName' => 'Kidney Function Test',
                'lab_required_sample_id' => $bloodSample?->id,
                'testSort' => 4,
                'expectedTime' => '120',
                'interpretation' => 'Urea, Creatinine, Uric Acid',
                'isActive' => true,
            ],
            [
                'id' => Str::uuid(),
                'testCode' => 'UR001',
                'testName' => 'Urine Routine',
                'lab_required_sample_id' => $urineSample?->id,
                'testSort' => 5,
                'expectedTime' => '30',
                'interpretation' => 'Physical, Chemical and Microscopic examination',
                'isActive' => true,
            ],
            [
                'id' => Str::uuid(),
                'testCode' => 'ST001',
                'testName' => 'Stool Routine',
                'lab_required_sample_id' => $stoolSample?->id,
                'testSort' => 6,
                'expectedTime' => '30',
                'interpretation' => 'Physical, Chemical and Microscopic examination',
                'isActive' => true,
            ],
            [
                'id' => Str::uuid(),
                'testCode' => 'THY001',
                'testName' => 'Thyroid Profile',
                'lab_required_sample_id' => $bloodSample?->id,
                'testSort' => 7,
                'expectedTime' => '180',
                'interpretation' => 'T3, T4, TSH',
                'isActive' => true,
            ],
            [
                'id' => Str::uuid(),
                'testCode' => 'DB001',
                'testName' => 'Diabetes Profile',
                'lab_required_sample_id' => $bloodSample?->id,
                'testSort' => 8,
                'expectedTime' => '60',
                'interpretation' => 'Fasting Blood Sugar, PP Blood Sugar, HbA1c',
                'isActive' => true,
            ],
        ];

        foreach ($tests as $test) {
            LabMasterTest::create($test);
        }
    }
}
