<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LabRequiredSample;
use Illuminate\Support\Str;

class LabRequiredSampleSeeder extends Seeder
{
    public function run(): void
    {
        LabRequiredSample::truncate();

        $samples = [
            ['id' => Str::uuid(), 'required_sample_name' => 'Blood'],
            ['id' => Str::uuid(), 'required_sample_name' => 'Serum'],
            ['id' => Str::uuid(), 'required_sample_name' => 'Plasma'],
            ['id' => Str::uuid(), 'required_sample_name' => 'Urine'],
            ['id' => Str::uuid(), 'required_sample_name' => 'Stool'],
            ['id' => Str::uuid(), 'required_sample_name' => 'CSF'],
            ['id' => Str::uuid(), 'required_sample_name' => 'Sputum'],
            ['id' => Str::uuid(), 'required_sample_name' => 'Swab'],
        ];

        foreach ($samples as $sample) {
            LabRequiredSample::create($sample);
        }
    }
}
