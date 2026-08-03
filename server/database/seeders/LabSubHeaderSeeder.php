<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LabSubHeader;
use Illuminate\Support\Str;

class LabSubHeaderSeeder extends Seeder
{
    public function run(): void
    {
        LabSubHeader::truncate();

        $subHeaders = [
            ['id' => Str::uuid(), 'sub_header_name' => 'Complete Blood Count'],
            ['id' => Str::uuid(), 'sub_header_name' => 'Lipid Profile'],
            ['id' => Str::uuid(), 'sub_header_name' => 'Liver Function Test'],
            ['id' => Str::uuid(), 'sub_header_name' => 'Kidney Function Test'],
            ['id' => Str::uuid(), 'sub_header_name' => 'Thyroid Profile'],
            ['id' => Str::uuid(), 'sub_header_name' => 'Diabetes Profile'],
            ['id' => Str::uuid(), 'sub_header_name' => 'Urine Routine'],
            ['id' => Str::uuid(), 'sub_header_name' => 'Stool Routine'],
        ];

        foreach ($subHeaders as $subHeader) {
            LabSubHeader::create($subHeader);
        }
    }
}
