<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabAnalyzerDataSeeder extends Seeder
{
    public function run(): void
    {
        $analyzer = DB::table('lab_analyzers')->first();
        $analyzerId = $analyzer ? $analyzer->id : null;

        $sampleData = [
            ['analyzerReffno' => 'LAB-26-1', 'paramName' => 'WBC', 'result' => '6.8', 'unit' => 'x 10^3/uL', 'flag' => 'N'],
            ['analyzerReffno' => 'LAB-26-1', 'paramName' => 'RBC', 'result' => '4.75', 'unit' => 'x 10^6/uL', 'flag' => 'N'],
            ['analyzerReffno' => 'LAB-26-1', 'paramName' => 'HGB', 'result' => '14.2', 'unit' => 'g/dL', 'flag' => 'N'],
            ['analyzerReffno' => 'LAB-26-1', 'paramName' => 'HCT', 'result' => '42.5', 'unit' => '%', 'flag' => 'N'],
            ['analyzerReffno' => 'LAB-26-1', 'paramName' => 'PLT', 'result' => '245', 'unit' => 'x 10^3/uL', 'flag' => 'N'],
            ['analyzerReffno' => 'LAB-26-2', 'paramName' => 'GLU', 'result' => '185', 'unit' => 'mg/dL', 'flag' => 'H'],
            ['analyzerReffno' => 'LAB-26-2', 'paramName' => 'UREA', 'result' => '32', 'unit' => 'mg/dL', 'flag' => 'N'],
            ['analyzerReffno' => 'LAB-26-2', 'paramName' => 'CREAT', 'result' => '0.9', 'unit' => 'mg/dL', 'flag' => 'N'],
        ];

        foreach ($sampleData as $item) {
            DB::table('lab_analyzer_data')->insert([
                'id' => (string) Str::uuid(),
                'analyzerId' => $analyzerId,
                'analyzerReffno' => $item['analyzerReffno'],
                'tdate' => now(),
                'paramName' => $item['paramName'],
                'result' => $item['result'],
                'unit' => $item['unit'],
                'flag' => $item['flag'],
                'isSynced' => false,
            ]);
        }
    }
}
