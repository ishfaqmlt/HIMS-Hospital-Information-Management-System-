<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LabHeader;
use Illuminate\Support\Str;

class LabHeaderSeeder extends Seeder
{
    public function run(): void
    {
        LabHeader::truncate();

        $headers = [
            ['id' => Str::uuid(), 'header_name' => 'Hematology'],
            ['id' => Str::uuid(), 'header_name' => 'Biochemistry'],
            ['id' => Str::uuid(), 'header_name' => 'Serology'],
            ['id' => Str::uuid(), 'header_name' => 'Microbiology'],
            ['id' => Str::uuid(), 'header_name' => 'Histopathology'],
            ['id' => Str::uuid(), 'header_name' => 'Cytology'],
            ['id' => Str::uuid(), 'header_name' => 'Immunology'],
            ['id' => Str::uuid(), 'header_name' => 'Virology'],
            ['id' => Str::uuid(), 'header_name' => 'Blood Bank'],
            ['id' => Str::uuid(), 'header_name' => 'Clinical Pathology'],
            ['id' => Str::uuid(), 'header_name' => 'Endocrinology'],
        ];

        foreach ($headers as $header) {
            LabHeader::create($header);
        }
    }
}
