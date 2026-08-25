<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterSymptomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $symptoms = [
            ['code' => 'fev', 'name' => 'Fever', 'is_active' => true],
            ['code' => 'cou', 'name' => 'Cough', 'is_active' => true],
            ['code' => 'hea', 'name' => 'Headache', 'is_active' => true],
            ['code' => 'sob', 'name' => 'Shortness of Breath', 'is_active' => true],
            ['code' => 'cp', 'name' => 'Chest Pain', 'is_active' => true],
            ['code' => 'nv', 'name' => 'Nausea & Vomiting', 'is_active' => true],
            ['code' => 'abd', 'name' => 'Abdominal Pain', 'is_active' => true],
            ['code' => 'fw', 'name' => 'Fatigue & Weakness', 'is_active' => true],
            ['code' => 'di', 'name' => 'Dizziness', 'is_active' => true],
            ['code' => 'ba', 'name' => 'Body Aches / Myalgia', 'is_active' => true],
        ];

        foreach ($symptoms as $symptom) {
            DB::table('master_symptoms')->updateOrInsert(
                ['code' => $symptom['code']],
                [
                    'id' => (string) Str::uuid(),
                    'name' => $symptom['name'],
                    'is_active' => $symptom['is_active'],
                ]
            );
        }
    }
}
