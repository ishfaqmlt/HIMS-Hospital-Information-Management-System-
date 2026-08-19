<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabShortKeySeeder extends Seeder
{
    public function run(): void
    {
        $shortKeys = [
            ['sKey' => 'ne', 'correctedKey' => 'Negative'],
            ['sKey' => 'p', 'correctedKey' => 'Positive'],
            ['sKey' => 't', 'correctedKey' => 'Trace'],
            ['sKey' => '+', 'correctedKey' => '( 1 + )*'],
            ['sKey' => '++', 'correctedKey' => '( 2 + )*'],
            ['sKey' => '+++', 'correctedKey' => '( 3 + )*'],
            ['sKey' => '++++', 'correctedKey' => '( 4 + )*'],
            ['sKey' => 'n', 'correctedKey' => 'Nil'],
            ['sKey' => 'pr', 'correctedKey' => 'Present'],
            ['sKey' => 'a', 'correctedKey' => '"A"'],
            ['sKey' => 'b', 'correctedKey' => '"B"'],
            ['sKey' => 'o', 'correctedKey' => '"O"'],
            ['sKey' => 'ab', 'correctedKey' => '"AB"'],
            ['sKey' => 'pv', 'correctedKey' => 'Plasmodium Vivax'],
            ['sKey' => 'pf', 'correctedKey' => 'Plasmodium Falciparum'],
            ['sKey' => 'dy', 'correctedKey' => 'Dark yellow*'],
            ['sKey' => 'ff', 'correctedKey' => 'Full Field*'],];

        foreach ($shortKeys as $item) {
            DB::table('lab_short_keys')->updateOrInsert(
                ['sKey' => $item['sKey']],
                [
                    'id' => (string) Str::uuid(),
                    'correctedKey' => $item['correctedKey'],
                    'isSynced' => false,
                ]
            );
        }
    }
}
