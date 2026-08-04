<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LabSubHeader;
use Illuminate\Support\Str;

class LabSubHeaderSeeder extends Seeder
{
    public function run(): void
    {
        LabSubHeader::query()->delete();

        $subHeaders = [
            'Empty',
            'DLC',
            'Renal Function Tests',
            'Liver Function Tests',
            'Lipid Profile',
            'Morphology',
            '1st Day Sample',
            '2nd Day Sample',
            '3rd Day Sample',
            'Physical Examination',
            'Chemical Examination',
            'Microscopic Examination',
            'Microscopy',
            'Patient',
            'Donor',
            'Typhoid Test',
            'Dengue Test',
            'Widal Test',
            'Anti Streptolysin O (ASO)',
            'Rheumatoid Factor (RF)',
            'Chemistry',
            'Follow Up',
            'Electrolytes',
            'Coombs Test',
            'Toxoplasmosis',
            'Oral Glucose Tolerance Test (OGTT)',
            'Motility',
            'Progressive Motility',
            'Thyroid Function Tests',
        ];

        foreach ($subHeaders as $name) {
            LabSubHeader::create([
                'id' => Str::uuid(),
                'sub_header_name' => $name,
            ]);
        }
    }
}
