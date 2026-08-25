<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterPhysicalExamSeeder extends Seeder
{
    public function run(): void
    {
        $exams = [
            ['name' => 'General Physical Examination', 'is_active' => true],
            ['name' => 'Chest & Lungs Auscultation', 'is_active' => true],
            ['name' => 'Cardiovascular System (CVS S1 S2)', 'is_active' => true],
            ['name' => 'Abdominal Palpation & Percussion', 'is_active' => true],
            ['name' => 'Central Nervous System (CNS) Exam', 'is_active' => true],
            ['name' => 'ENT (Ear, Nose & Throat)', 'is_active' => true],
            ['name' => 'Musculoskeletal & Joint Exam', 'is_active' => true],
            ['name' => 'Skin & Soft Tissue Inspection', 'is_active' => true],
            ['name' => 'Pupillary & Ophthalmic Examination', 'is_active' => true],
            ['name' => 'Lymph Node Palpation', 'is_active' => true],
        ];

        foreach ($exams as $exam) {
            DB::table('master_physical_exam')->updateOrInsert(
                ['name' => $exam['name']],
                [
                    'id' => (string) Str::uuid(),
                    'is_active' => $exam['is_active'],
                ]
            );
        }
    }
}
