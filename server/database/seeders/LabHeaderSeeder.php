<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LabHeader;

class LabHeaderSeeder extends Seeder
{
    public function run(): void
    {
        LabHeader::truncate();

        $headers = [
            ['header_name' => 'Hematology'],
            ['header_name' => 'Chemistry'],
            ['header_name' => 'Microbiology'],
            ['header_name' => 'Immunology'],
            ['header_name' => 'Urinalysis'],
            ['header_name' => 'Stool Analysis'],
            ['header_name' => 'Serology'],
            ['header_name' => 'Endocrinology'],
        ];

        foreach ($headers as $header) {
            LabHeader::create($header);
        }
    }
}
