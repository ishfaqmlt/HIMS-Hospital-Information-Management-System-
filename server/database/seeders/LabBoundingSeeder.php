<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabBoundingSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('lab_boundings')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $getParameterId = function ($parameterName, $serviceCode = null) {
            $query = DB::table('lab_master_test_parameters')
                ->join('lab_master_tests', 'lab_master_test_parameters.master_test_id', '=', 'lab_master_tests.id')
                ->join('services', 'lab_master_tests.serviceId', '=', 'services.id')
                ->where('lab_master_test_parameters.parameterName', $parameterName);

            if ($serviceCode) {
                $query->where('services.Code', $serviceCode);
            }

            return $query->value('lab_master_test_parameters.id');
        };

        $boundings = [
            // BSR (1213)
            [
                'code' => '1213',
                'parameter' => 'Blood Sugar Random',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 60, 'upperBound' => 140,
                'lowerCritical' => 40, 'upperCritical' => 250,
            ],

            // BSF (1212)
            [
                'code' => '1212',
                'parameter' => 'Blood Sugar Fasting',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 70, 'upperBound' => 110,
                'lowerCritical' => 50, 'upperCritical' => 200,
            ],

            // Blood Urea (1214)
            [
                'code' => '1214',
                'parameter' => 'Blood Urea',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 15, 'upperBound' => 45,
                'lowerCritical' => 5, 'upperCritical' => 100,
            ],

            // Serum Creatinine (1215 - Male)
            [
                'code' => '1215',
                'parameter' => 'Serum Creatinine',
                'gender' => 'Male',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 0.6, 'upperBound' => 1.3,
                'lowerCritical' => 0.3, 'upperCritical' => 4.0,
            ],
            // Serum Creatinine (1215 - Female)
            [
                'code' => '1215',
                'parameter' => 'Serum Creatinine',
                'gender' => 'Female',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 0.5, 'upperBound' => 1.1,
                'lowerCritical' => 0.3, 'upperCritical' => 4.0,
            ],

            // Uric Acid (1216 - Male)
            [
                'code' => '1216',
                'parameter' => 'Uric Acid',
                'gender' => 'Male',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 3.4, 'upperBound' => 7.0,
                'lowerCritical' => 1.5, 'upperCritical' => 10.0,
            ],
            // Uric Acid (1216 - Female)
            [
                'code' => '1216',
                'parameter' => 'Uric Acid',
                'gender' => 'Female',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 2.4, 'upperBound' => 5.7,
                'lowerCritical' => 1.5, 'upperCritical' => 9.0,
            ],

            // CBC - WBC Count (1201)
            [
                'code' => '1201',
                'parameter' => 'WBC Count',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 4.0, 'upperBound' => 11.0,
                'lowerCritical' => 2.0, 'upperCritical' => 50.0,
            ],

            // CBC - Hemoglobin (1201 - Male)
            [
                'code' => '1201',
                'parameter' => 'Hemoglobin (Hb)',
                'gender' => 'Male',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 13.5, 'upperBound' => 17.5,
                'lowerCritical' => 6.0, 'upperCritical' => 20.0,
            ],
            // CBC - Hemoglobin (1201 - Female)
            [
                'code' => '1201',
                'parameter' => 'Hemoglobin (Hb)',
                'gender' => 'Female',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 12.0, 'upperBound' => 16.0,
                'lowerCritical' => 6.0, 'upperCritical' => 18.0,
            ],

            // CBC - Platelets Count (1201)
            [
                'code' => '1201',
                'parameter' => 'Platelets Count',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 150, 'upperBound' => 450,
                'lowerCritical' => 50, 'upperCritical' => 1000,
            ],

            // ALT / SGPT (1220 - Male)
            [
                'code' => '1220',
                'parameter' => 'ALT / SGPT',
                'gender' => 'Male',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 0, 'upperBound' => 41,
                'lowerCritical' => 0, 'upperCritical' => 3000,
            ],
            // ALT / SGPT (1220 - Female)
            [
                'code' => '1220',
                'parameter' => 'ALT / SGPT',
                'gender' => 'Female',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 0, 'upperBound' => 31,
                'lowerCritical' => 0, 'upperCritical' => 3000,
            ],  
            // AST / SGOT (1221 - Male)
            [
                'code' => '1221',
                'parameter' => 'AST / SGOT',
                'gender' => 'Male',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 0, 'upperBound' => 41,
                'lowerCritical' => 0, 'upperCritical' => 3000,
            ],
            // AST / SGOT (1221 - Female)
            [
                'code' => '1221',
                'parameter' => 'AST / SGOT',
                'gender' => 'Female',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 0, 'upperBound' => 31,
                'lowerCritical' => 0, 'upperCritical' => 3000,
            ],
            // Alkaline Phosphatase (1222)
            [
                'code' => '1222',
                'parameter' => 'Alkaline Phosphatase',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 0, 'upperBound' => 258,
                'lowerCritical' => 30, 'upperCritical' => 2000,
            ],

            // Serum Cholesterol (1227)
            [
                'code' => '1227',
                'parameter' => 'Serum Cholesterol',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 0, 'upperBound' => 240,
                'lowerCritical' => 0, 'upperCritical' => 350,
            ],

            // Serum Triglyceride (1228)
            [
                'code' => '1228',
                'parameter' => 'Serum Triglyceride',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 0, 'upperBound' => 150,
                'lowerCritical' => 0, 'upperCritical' => 400,
            ],

            // Electrolytes - Sodium (1245)
            [
                'code' => '1245',
                'parameter' => 'Sodium (Na+)',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 135, 'upperBound' => 145,
                'lowerCritical' => 120, 'upperCritical' => 160,
            ],

            // Electrolytes - Potassium (1245)
            [
                'code' => '1245',
                'parameter' => 'Potassium (K+)',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 3.5, 'upperBound' => 5.0,
                'lowerCritical' => 2.5, 'upperCritical' => 6.0,
            ],

            // Electrolytes - Chloride (1245)
            [
                'code' => '1245',
                'parameter' => 'Chloride (Cl-)',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000    ,
                'lowerBound' => 98, 'upperBound' => 107,
                'lowerCritical' => 85, 'upperCritical' => 120,
            ],

            // Calcium (1246)
            [
                'code' => '1246',
                'parameter' => 'Serum Calcium',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 8.5, 'upperBound' => 10.5,
                'lowerCritical' => 6.5, 'upperCritical' => 13.0,
            ],

            // Phosphorus (1247)
            [
                'code' => '1247',
                'parameter' => 'Serum Phosphorus',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 2.5, 'upperBound' => 4.5,
                'lowerCritical' => 1.5, 'upperCritical' => 7.0,
            ],

            // Magnesium (1248)
            [
                'code' => '1248',
                'parameter' => 'Serum Magnesium',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 1.7, 'upperBound' => 2.2,
                'lowerCritical' => 1.0, 'upperCritical' => 4.0,
            ],

            // CRP (1243)
            [
                'code' => '1243',
                'parameter' => 'CRP',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 0, 'upperBound' => 6.0,
                'lowerCritical' => 0, 'upperCritical' => 50.0,
            ],

            // Rheumatoid Factor (1259)
            [
                'code' => '1259',
                'parameter' => 'Rheumatoid Factor',
                'gender' => 'Both',
                'fromAge' => 0, 'toAge' => 200, 'ageType' => 'Years',
                'fromAgeDays' => 0, 'toAgeDays' => 73000,
                'lowerBound' => 0, 'upperBound' => 8,
                'lowerCritical' => 0, 'upperCritical' => 100.0,
            ],
        ];

        foreach ($boundings as $b) {
            $parameterId = $getParameterId($b['parameter'], $b['code']);
            if (!$parameterId) continue;

            DB::table('lab_boundings')->insert([
                'id' => Str::uuid(),
                'parameterId' => $parameterId,
                'gender' => $b['gender'],
                'fromAge' => $b['fromAge'],
                'toAge' => $b['toAge'],
                'ageType' => $b['ageType'],
                'fromAgeDays' => $b['fromAgeDays'],
                'toAgeDays' => $b['toAgeDays'],
                'lowerBound' => $b['lowerBound'],
                'upperBound' => $b['upperBound'],
                'lowerCritical' => $b['lowerCritical'],
                'upperCritical' => $b['upperCritical'],
                'isSynced' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
