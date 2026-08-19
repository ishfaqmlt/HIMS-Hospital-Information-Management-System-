<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabAnalyzerSeeder extends Seeder
{
    public function run(): void
    {
        $analyzers = [
            [
                'name' => 'Sysmex XN-550 Hematology Analyzer',
                'manufacturer' => 'Sysmex',
                'model' => 'XN-550',
                'communicationType' => 'TCP',
                'protocol' => 'ASTM',
                'direction' => 'BIDIRECTIONAL',
                'host' => '192.168.1.101',
                'port' => 5100,
                'comPort' => null,
                'baudRate' => 9600,
                'parity' => 'None',
                'dataBits' => 8,
                'stopBits' => 1.0,
                'isActive' => true,
            ],
            [
                'name' => 'Roche Cobas c311 Chemistry Analyzer',
                'manufacturer' => 'Roche',
                'model' => 'Cobas c311',
                'communicationType' => 'SERIAL',
                'protocol' => 'ASTM',
                'direction' => 'UNIDIRECTIONAL',
                'host' => null,
                'port' => null,
                'comPort' => 'COM1',
                'baudRate' => 9600,
                'parity' => 'None',
                'dataBits' => 8,
                'stopBits' => 1.0,
                'isActive' => true,
            ],
            [
                'name' => 'Mindray BS-240 Clinical Chemistry Analyzer',
                'manufacturer' => 'Mindray',
                'model' => 'BS-240',
                'communicationType' => 'TCP',
                'protocol' => 'HL7',
                'direction' => 'BIDIRECTIONAL',
                'host' => '192.168.1.102',
                'port' => 9100,
                'comPort' => null,
                'baudRate' => 9600,
                'parity' => 'None',
                'dataBits' => 8,
                'stopBits' => 1.0,
                'isActive' => true,
            ],
        ];

        foreach ($analyzers as $item) {
            DB::table('lab_analyzers')->updateOrInsert(
                ['name' => $item['name']],
                array_merge($item, [
                    'id' => (string) Str::uuid(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
