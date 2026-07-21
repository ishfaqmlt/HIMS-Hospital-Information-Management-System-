<?php

namespace Database\Seeders;

use App\Models\VisitType;
use Illuminate\Database\Seeder;

class VisitTypeSeeder extends Seeder
{
    public function run(): void
    {
        $visitTypes = ['General', 'IPD','Emergency','Insurance','Telemedicine','Home Visit'];

        foreach ($visitTypes as $type) {
            VisitType::firstOrCreate(['visitType' => $type]);
        }
    }
}
