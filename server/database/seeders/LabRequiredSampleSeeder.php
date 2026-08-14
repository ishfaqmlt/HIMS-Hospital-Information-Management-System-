<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LabRequiredSample;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabRequiredSampleSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        LabRequiredSample::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $requiredSamples = [
            '3-5 cc Clotted Blood or Serum',
            '3 cc EDTA Blood (CBC Vial)',
            'Sodium Citrate Blood (Coagulation Vial)',
            '3 cc Fluoride Blood (Glucose Vial)',
            'Sport Urine',
            '24-Hour Urine',
            'Stool',
            'Sputum',
            'CSF',
            'Swab',
            'Pap Smear',
            'Pleural Fluid',
            'Ascitic Fluid',
            'Synovial Fluid',
            'Bone Marrow Aspirate',
            'Bone Marrow Biopsy',
            'Amniotic Fluid',
            'Seminal Fluid',
            'Hair',
            'Nail',
            'Skin Biopsy',
            'Milk (Breast Milk)',
            'Saliva',
            'Bronchial Washings',
            'Bronchoalveolar Lavage',
            'Fine Needle Aspiration (FNA) Sample',
            'Catheter Tip',
            'Drain Tip',
        ];

        foreach ($requiredSamples as $sampleName) {
            LabRequiredSample::create([
                'id' => Str::uuid(),
                'required_sample_name' => $sampleName,
            ]);
        }
    }
}
