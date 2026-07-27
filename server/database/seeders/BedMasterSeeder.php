<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BedMasterSeeder extends Seeder
{
    public function run(): void
    {
        $floors = DB::table('floor_master')->pluck('id', 'FloorName');
        $rooms = DB::table('rooms_wards_master')->get()->keyBy('id');

        $beds = [
            ['floor' => 'Basement', 'roomIdx' => 0, 'beds' => ['B-01', 'B-02', 'B-03']],
            ['floor' => '1st Floor', 'roomIdx' => 0, 'beds' => ['101-A', '101-B']],
            ['floor' => '1st Floor', 'roomIdx' => 1, 'beds' => ['102-A', '102-B']],
            ['floor' => '1st Floor', 'roomIdx' => 2, 'beds' => ['1W-01', '1W-02', '1W-03']],
            ['floor' => '2nd Floor', 'roomIdx' => 0, 'beds' => ['201-A', '201-B']],
            ['floor' => '2nd Floor', 'roomIdx' => 1, 'beds' => ['202-A', '202-B']],
            ['floor' => '2nd Floor', 'roomIdx' => 2, 'beds' => ['2W-01', '2W-02', '2W-03']],
            ['floor' => '3rd Floor', 'roomIdx' => 0, 'beds' => ['301-A', '301-B']],
            ['floor' => '3rd Floor', 'roomIdx' => 1, 'beds' => ['3W-01', '3W-02', '3W-03']],
        ];

        foreach ($beds as $group) {
            if (!isset($floors[$group['floor']])) continue;

            $floorId = $floors[$group['floor']];
            $floorRooms = DB::table('rooms_wards_master')->where('floorId', $floorId)->get();

            if (!isset($floorRooms[$group['roomIdx']])) continue;

            $roomWardId = $floorRooms[$group['roomIdx']]->id;
            $isPrivate = $floorRooms[$group['roomIdx']]->RoomWardType === 'Private Room';
            $rent = $isPrivate ? 5000.00 : 2000.00;
            $ac = $isPrivate ? 1500.00 : 500.00;

            foreach ($group['beds'] as $bedNo) {
                DB::table('bed_master')->insert([
                    'id' => Str::uuid(),
                    'floorId' => $floorId,
                    'roomWardId' => $roomWardId,
                    'BedNo' => $bedNo,
                    'Rent' => $rent,
                    'AcCharges' => $ac,
                    'isOccupied' => false,
                    'isFunctional' => true,
                    'isSynced' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
