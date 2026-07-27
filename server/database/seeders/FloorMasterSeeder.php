<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FloorMasterSeeder extends Seeder
{
    public function run(): void
    {
        $floors = ['Basement', '1st Floor', '2nd Floor', '3rd Floor'];

        foreach ($floors as $floor) {
            DB::table('floor_master')->insert([
                'id' => Str::uuid(),
                'FloorName' => $floor,
                'isFunctional' => true,
                'isSynced' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
