<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LabHeader;
use Illuminate\Support\Str;

use Illuminate\Support\Facades\DB;

class LabHeaderSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        LabHeader::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $headers = [
            ['id' => Str::uuid(), 'header_name' => 'Hematology', 'sortBy' => 1],
            ['id' => Str::uuid(), 'header_name' => 'Biochemistry', 'sortBy' => 2],
            ['id' => Str::uuid(), 'header_name' => 'Serology', 'sortBy' => 3],
            ['id' => Str::uuid(), 'header_name' => 'Blood Bank', 'sortBy' => 4],
            ['id' => Str::uuid(), 'header_name' => 'Microbiology', 'sortBy' => 5],
            ['id' => Str::uuid(), 'header_name' => 'Endocrinology', 'sortBy' => 6],
            ['id' => Str::uuid(), 'header_name' => 'Clinical Pathology', 'sortBy' => 7],
            ['id' => Str::uuid(), 'header_name' => 'Virology', 'sortBy' => 8],
            ['id' => Str::uuid(), 'header_name' => 'Histopathology', 'sortBy' => 9],
            ['id' => Str::uuid(), 'header_name' => 'Cytology', 'sortBy' => 10],
            ['id' => Str::uuid(), 'header_name' => 'Immunology', 'sortBy' => 11],
        ];

        foreach ($headers as $header) {
            LabHeader::create($header);
        }
    }
}
