<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterAllergySeeder extends Seeder
{
    public function run(): void
    {
        $allergies = [
            ['code' => 'ALG-001', 'name' => 'Penicillin', 'is_active' => true],
            ['code' => 'ALG-002', 'name' => 'Sulfa Drugs', 'is_active' => true],
            ['code' => 'ALG-003', 'name' => 'Aspirin / NSAIDs', 'is_active' => true],
            ['code' => 'ALG-004', 'name' => 'Latex', 'is_active' => true],
            ['code' => 'ALG-005', 'name' => 'Peanuts & Tree Nuts', 'is_active' => true],
            ['code' => 'ALG-006', 'name' => 'Dust Mites', 'is_active' => true],
            ['code' => 'ALG-007', 'name' => 'Contrast Dye', 'is_active' => true],
            ['code' => 'ALG-008', 'name' => 'Seafood / Shellfish', 'is_active' => true],
            ['code' => 'ALG-009', 'name' => 'Pollen / Seasonal', 'is_active' => true],
            ['code' => 'ALG-010', 'name' => 'Lactose / Milk', 'is_active' => true],
        ];

        foreach ($allergies as $allergy) {
            DB::table('master_allergies')->updateOrInsert(
                ['code' => $allergy['code']],
                [
                    'id' => (string) Str::uuid(),
                    'name' => $allergy['name'],
                    'is_active' => $allergy['is_active'],
                ]
            );
        }
    }
}
