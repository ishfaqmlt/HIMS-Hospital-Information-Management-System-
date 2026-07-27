<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RoomsWardsMasterSeeder extends Seeder
{
    public function run(): void
    {
        $floors = DB::table('floor_master')->pluck('id', 'FloorName');

        $rooms = [
            ['floor' => 'Basement', 'type' => 'Ward', 'name' => 'Emergency Ward'],
            ['floor' => '1st Floor', 'type' => 'Private Room', 'name' => 'Private Room 101'],
            ['floor' => '1st Floor', 'type' => 'Private Room', 'name' => 'Private Room 102'],
            ['floor' => '1st Floor', 'type' => 'Ward', 'name' => 'General Ward 1'],
            ['floor' => '2nd Floor', 'type' => 'Private Room', 'name' => 'Private Room 201'],
            ['floor' => '2nd Floor', 'type' => 'Private Room', 'name' => 'Private Room 202'],
            ['floor' => '2nd Floor', 'type' => 'Ward', 'name' => 'General Ward 2'],
            ['floor' => '3rd Floor', 'type' => 'Private Room', 'name' => 'Private Room 301'],
            ['floor' => '3rd Floor', 'type' => 'Ward', 'name' => 'General Ward 3'],
        ];

        foreach ($rooms as $room) {
            if (isset($floors[$room['floor']])) {
                DB::table('rooms_wards_master')->insert([
                    'id' => Str::uuid(),
                    'floorId' => $floors[$room['floor']],
                    'RoomWardType' => $room['type'],
                    'RoomWardName' => $room['name'],
                    'isFunctional' => true,
                    'isSynced' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
