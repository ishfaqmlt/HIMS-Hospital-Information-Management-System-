<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterDiagnosisSeeder extends Seeder
{
    public function run(): void
    {
        $diagnoses = [
            ['name' => 'Essential Primary Hypertension', 'is_active' => true],
            ['name' => 'Type 2 Diabetes Mellitus', 'is_active' => true],
            ['name' => 'Acute Upper Respiratory Tract Infection (URTI)', 'is_active' => true],
            ['name' => 'Acute Gastroenteritis (AGE)', 'is_active' => true],
            ['name' => 'Bronchial Asthma', 'is_active' => true],
            ['name' => 'Migraine Headache', 'is_active' => true],
            ['name' => 'Urinary Tract Infection (UTI)', 'is_active' => true],
            ['name' => 'Gastroesophageal Reflux Disease (GERD)', 'is_active' => true],
            ['name' => 'Allergic Rhinitis', 'is_active' => true],
            ['name' => 'Primary Osteoarthritis', 'is_active' => true],
        ];

        foreach ($diagnoses as $diag) {
            DB::table('master_diagnosis')->updateOrInsert(
                ['name' => $diag['name']],
                [
                    'id' => (string) Str::uuid(),
                    'is_active' => $diag['is_active'],
                ]
            );
        }
    }
}
