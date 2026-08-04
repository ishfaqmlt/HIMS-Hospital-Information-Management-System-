<?php
namespace Database\Seeders;

use App\Models\LabRequiredSample;
use Illuminate\Database\Seeder;

class RequiredSampleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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

        foreach ($requiredSamples as $requiredSample) {
            LabRequiredSample::firstOrCreate([
                'required_sample_name' => $requiredSample,
            ]);
        }
    }
}
