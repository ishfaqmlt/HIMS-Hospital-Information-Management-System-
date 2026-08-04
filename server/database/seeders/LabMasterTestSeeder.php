<?php

namespace Database\Seeders;

use App\Models\LabMasterTest;
use App\Models\LabRequiredSample;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LabMasterTestSeeder extends Seeder
{
    public function run(): void
    {
        $edta = LabRequiredSample::where('required_sample_name', '3 cc EDTA Blood (CBC Vial)')->first()?->id;
        $clotted = LabRequiredSample::where('required_sample_name', '3-5 cc Clotted Blood or Serum')->first()?->id;
        $citrated = LabRequiredSample::where('required_sample_name', 'Sodium Citrate Blood (Coagulation Vial)')->first()?->id;
        $urine = LabRequiredSample::where('required_sample_name', 'Sport Urine')->first()?->id;
        $stool = LabRequiredSample::where('required_sample_name', 'Stool')->first()?->id;
        $csf = LabRequiredSample::where('required_sample_name', 'CSF')->first()?->id;
        $ascitic = LabRequiredSample::where('required_sample_name', 'Ascitic Fluid')->first()?->id;
        $pleural = LabRequiredSample::where('required_sample_name', 'Pleural Fluid')->first()?->id;
        $synovial = LabRequiredSample::where('required_sample_name', 'Synovial Fluid')->first()?->id;
        $sputum = LabRequiredSample::where('required_sample_name', 'Sputum')->first()?->id;
        $seminal = LabRequiredSample::where('required_sample_name', 'Seminal Fluid')->first()?->id;

        $tests = [
            // Hematology
            ['testCode' => 'CBC', 'testName' => 'Complete Blood Count', 'lab_required_sample_id' => $edta, 'testSort' => 1, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'ESR', 'testName' => 'Erythrocyte Sedimentation Rate', 'lab_required_sample_id' => $edta, 'testSort' => 2, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'HB', 'testName' => 'Hemoglobin', 'lab_required_sample_id' => $edta, 'testSort' => 3, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'TLC', 'testName' => 'Total Leukocyte Count', 'lab_required_sample_id' => $edta, 'testSort' => 4, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'DLC', 'testName' => 'Differential Leukocyte Count', 'lab_required_sample_id' => $edta, 'testSort' => 5, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'PLT', 'testName' => 'Platelet Count', 'lab_required_sample_id' => $edta, 'testSort' => 6, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Retics', 'testName' => 'Reticulocyte Count', 'lab_required_sample_id' => $edta, 'testSort' => 7, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'PF', 'testName' => 'Peripheral Film', 'lab_required_sample_id' => $edta, 'testSort' => 8, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'BT', 'testName' => 'Bleeding Time', 'lab_required_sample_id' => null, 'testSort' => 9, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'CT', 'testName' => 'Clotting Time', 'lab_required_sample_id' => null, 'testSort' => 10, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'PT', 'testName' => 'Prothrombin Time', 'lab_required_sample_id' => $citrated, 'testSort' => 11, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'APTT', 'testName' => 'Activated Partial Thromboplastin Time', 'lab_required_sample_id' => $citrated, 'testSort' => 12, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'MP', 'testName' => 'Malaria Parasite', 'lab_required_sample_id' => $edta, 'testSort' => 13, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Dir Coombs', 'testName' => 'Direct Coombs Test', 'lab_required_sample_id' => $edta, 'testSort' => 14, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Indirect Coombs', 'testName' => 'Indirect Coombs Test', 'lab_required_sample_id' => $clotted, 'testSort' => 15, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Blood Group', 'testName' => 'Blood Grouping', 'lab_required_sample_id' => $edta, 'testSort' => 16, 'expectedTime' => '15', 'isActive' => true],

            // Serology / Immunology
            ['testCode' => 'RA', 'testName' => 'Rheumatoid Arthritis (RA) Factor', 'lab_required_sample_id' => $clotted, 'testSort' => 17, 'expectedTime' => '120', 'isActive' => true],
            ['testCode' => 'CRP', 'testName' => 'C-Reactive Protein', 'lab_required_sample_id' => $clotted, 'testSort' => 18, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'CRP HS', 'testName' => 'CRP (High Sensitive)', 'lab_required_sample_id' => $clotted, 'testSort' => 19, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'ASO', 'testName' => 'Anti-Streptolysin O (ASO)', 'lab_required_sample_id' => $clotted, 'testSort' => 20, 'expectedTime' => '120', 'isActive' => true],
            ['testCode' => 'HIV', 'testName' => 'HIV 1 & 2', 'lab_required_sample_id' => $clotted, 'testSort' => 21, 'expectedTime' => '120', 'isActive' => true],
            ['testCode' => 'HBsAg', 'testName' => 'Hepatitis B Surface Antigen', 'lab_required_sample_id' => $clotted, 'testSort' => 22, 'expectedTime' => '120', 'isActive' => true],
            ['testCode' => 'Anti HCV', 'testName' => 'Anti Hepatitis C Virus', 'lab_required_sample_id' => $clotted, 'testSort' => 23, 'expectedTime' => '120', 'isActive' => true],
            ['testCode' => 'VDRL', 'testName' => 'Venereal Disease Research Laboratory', 'lab_required_sample_id' => $clotted, 'testSort' => 24, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Typhi Dot', 'testName' => 'Typhi Dot IgM & IgG', 'lab_required_sample_id' => $clotted, 'testSort' => 25, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Widal', 'testName' => 'Widal Test', 'lab_required_sample_id' => $clotted, 'testSort' => 26, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Dengue NS1', 'testName' => 'Dengue Test (NS1)', 'lab_required_sample_id' => $clotted, 'testSort' => 27, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Dengue IgM IgG', 'testName' => 'Dengue (IgM, IgG)', 'lab_required_sample_id' => $clotted, 'testSort' => 28, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Dengue Panel', 'testName' => 'Dengue Test (NS1, IgM, IgG)', 'lab_required_sample_id' => $clotted, 'testSort' => 29, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Beta HCG', 'testName' => 'Beta HCG (Pregnancy)', 'lab_required_sample_id' => $clotted, 'testSort' => 30, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'H Pylori', 'testName' => 'H. Pylori Antibody', 'lab_required_sample_id' => $clotted, 'testSort' => 31, 'expectedTime' => '60', 'isActive' => true],

            // Clinical Chemistry - Liver
            ['testCode' => 'Albumin', 'testName' => 'Serum Albumin', 'lab_required_sample_id' => $clotted, 'testSort' => 32, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Total Protein', 'testName' => 'Total Protein', 'lab_required_sample_id' => $clotted, 'testSort' => 33, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Bili Total', 'testName' => 'Bilirubin Total', 'lab_required_sample_id' => $clotted, 'testSort' => 34, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Bili Direct', 'testName' => 'Bilirubin Direct', 'lab_required_sample_id' => $clotted, 'testSort' => 35, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'ALT', 'testName' => 'ALT (SGPT)', 'lab_required_sample_id' => $clotted, 'testSort' => 36, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'AST', 'testName' => 'AST (SGOT)', 'lab_required_sample_id' => $clotted, 'testSort' => 37, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Alk Phos', 'testName' => 'Alkaline Phosphatase', 'lab_required_sample_id' => $clotted, 'testSort' => 38, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Serum Amylase', 'testName' => 'Serum Amylase', 'lab_required_sample_id' => $clotted, 'testSort' => 39, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'LFTs', 'testName' => 'Liver Function Tests', 'lab_required_sample_id' => $clotted, 'testSort' => 40, 'expectedTime' => '120', 'isActive' => true],

            // Clinical Chemistry - Renal
            ['testCode' => 'Blood Urea', 'testName' => 'Blood Urea', 'lab_required_sample_id' => $clotted, 'testSort' => 41, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'BUN', 'testName' => 'Blood Urea Nitrogen', 'lab_required_sample_id' => $clotted, 'testSort' => 42, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Creatinine', 'testName' => 'Serum Creatinine', 'lab_required_sample_id' => $clotted, 'testSort' => 43, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Uric Acid', 'testName' => 'Uric Acid', 'lab_required_sample_id' => $clotted, 'testSort' => 44, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'S Calcium', 'testName' => 'Serum Calcium', 'lab_required_sample_id' => $clotted, 'testSort' => 45, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'RFTs', 'testName' => 'Renal Function Tests', 'lab_required_sample_id' => $clotted, 'testSort' => 46, 'expectedTime' => '120', 'isActive' => true],

            // Clinical Chemistry - Lipid & Glucose
            ['testCode' => 'BSF', 'testName' => 'Blood Sugar Fasting', 'lab_required_sample_id' => $clotted, 'testSort' => 47, 'expectedTime' => '15', 'isActive' => true],
            ['testCode' => 'BSR', 'testName' => 'Blood Sugar Random', 'lab_required_sample_id' => $clotted, 'testSort' => 48, 'expectedTime' => '15', 'isActive' => true],
            ['testCode' => 'BSR 2hr', 'testName' => 'BSR (2hr After Breakfast)', 'lab_required_sample_id' => $clotted, 'testSort' => 49, 'expectedTime' => '15', 'isActive' => true],
            ['testCode' => 'HbA1c', 'testName' => 'Glycated Hemoglobin', 'lab_required_sample_id' => $edta, 'testSort' => 50, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'OGTT', 'testName' => 'Oral Glucose Tolerance Test', 'lab_required_sample_id' => $clotted, 'testSort' => 51, 'expectedTime' => '180', 'isActive' => true],
            ['testCode' => 'Cholesterol', 'testName' => 'Total Cholesterol', 'lab_required_sample_id' => $clotted, 'testSort' => 52, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Triglycerides', 'testName' => 'Triglycerides', 'lab_required_sample_id' => $clotted, 'testSort' => 53, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'HDL', 'testName' => 'HDL Cholesterol', 'lab_required_sample_id' => $clotted, 'testSort' => 54, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'LDL', 'testName' => 'LDL Cholesterol', 'lab_required_sample_id' => $clotted, 'testSort' => 55, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Lipid Profile', 'testName' => 'Lipid Profile', 'lab_required_sample_id' => $clotted, 'testSort' => 56, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'CPK', 'testName' => 'Creatine Phosphokinase', 'lab_required_sample_id' => $clotted, 'testSort' => 57, 'expectedTime' => '60', 'isActive' => true],

            // Hormones
            ['testCode' => 'TSH', 'testName' => 'TSH (Thyroid Stimulating Hormone)', 'lab_required_sample_id' => $clotted, 'testSort' => 58, 'expectedTime' => '120', 'isActive' => true],
            ['testCode' => 'FSH', 'testName' => 'FSH (Follicle Stimulating Hormone)', 'lab_required_sample_id' => $clotted, 'testSort' => 59, 'expectedTime' => '120', 'isActive' => true],
            ['testCode' => 'LH', 'testName' => 'LH (Luteinizing Hormone)', 'lab_required_sample_id' => $clotted, 'testSort' => 60, 'expectedTime' => '120', 'isActive' => true],
            ['testCode' => 'Prolactin', 'testName' => 'Prolactin', 'lab_required_sample_id' => $clotted, 'testSort' => 61, 'expectedTime' => '120', 'isActive' => true],

            // Urine & Stool
            ['testCode' => 'Urine R/E', 'testName' => 'Urine Routine Examination', 'lab_required_sample_id' => $urine, 'testSort' => 62, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Stool R/E', 'testName' => 'Stool Routine Examination', 'lab_required_sample_id' => $stool, 'testSort' => 63, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Spot Urine Protein', 'testName' => 'Spot Urine Protein', 'lab_required_sample_id' => $urine, 'testSort' => 64, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Urine PCR', 'testName' => 'Urine Protein Creatinine Ratio', 'lab_required_sample_id' => $urine, 'testSort' => 65, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Stool Occult', 'testName' => 'Stool Occult Blood', 'lab_required_sample_id' => $stool, 'testSort' => 66, 'expectedTime' => '30', 'isActive' => true],
            ['testCode' => 'Urine C/S', 'testName' => 'Urine Culture & Sensitivity', 'lab_required_sample_id' => $urine, 'testSort' => 67, 'expectedTime' => '1440', 'isActive' => true],
            ['testCode' => 'Blood C/S', 'testName' => 'Blood Culture & Sensitivity', 'lab_required_sample_id' => $clotted, 'testSort' => 68, 'expectedTime' => '1440', 'isActive' => true],

            // Body Fluids
            ['testCode' => 'CSF Analysis', 'testName' => 'CSF Analysis', 'lab_required_sample_id' => $csf, 'testSort' => 69, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Ascitic Fluid', 'testName' => 'Ascitic Fluid Analysis', 'lab_required_sample_id' => $ascitic, 'testSort' => 70, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Pleural Fluid', 'testName' => 'Pleural Fluid Analysis', 'lab_required_sample_id' => $pleural, 'testSort' => 71, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Synovial Fluid', 'testName' => 'Synovial Fluid Analysis', 'lab_required_sample_id' => $synovial, 'testSort' => 72, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Fluid Analysis', 'testName' => 'Fluid Analysis (General)', 'lab_required_sample_id' => null, 'testSort' => 73, 'expectedTime' => '60', 'isActive' => true],

            // Microbiology
            ['testCode' => 'Sputum AFB', 'testName' => 'Sputum for AFB', 'lab_required_sample_id' => $sputum, 'testSort' => 74, 'expectedTime' => '60', 'isActive' => true],
            ['testCode' => 'Pus Cytology', 'testName' => 'Pus for Cytology', 'lab_required_sample_id' => null, 'testSort' => 75, 'expectedTime' => '60', 'isActive' => true],

            // Semen Analysis
            ['testCode' => 'Semen Analysis', 'testName' => 'Semen Analysis', 'lab_required_sample_id' => $seminal, 'testSort' => 76, 'expectedTime' => '60', 'isActive' => true],

            // Special Tests
            ['testCode' => 'Pregnancy Test', 'testName' => 'Pregnancy Test (Urine)', 'lab_required_sample_id' => $urine, 'testSort' => 77, 'expectedTime' => '15', 'isActive' => true],
            ['testCode' => 'Baseline', 'testName' => 'Baseline Tests (Panel)', 'lab_required_sample_id' => $clotted, 'testSort' => 78, 'expectedTime' => '120', 'isActive' => true],
            ['testCode' => 'PRP', 'testName' => 'PRP Plasma Preparation', 'lab_required_sample_id' => $edta, 'testSort' => 79, 'expectedTime' => '60', 'isActive' => true],
        ];

        foreach ($tests as $test) {
            LabMasterTest::firstOrCreate(
                ['testCode' => $test['testCode']],
                $test
            );
        }
    }
}
