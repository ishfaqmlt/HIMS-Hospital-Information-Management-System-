<?php

namespace Database\Seeders;

use App\Models\VisitType;
use Illuminate\Database\Seeder;

class VisitTypeSeeder extends Seeder
{
    public function run(): void
    {
        $visitTypes = ['OPD', 'IPD'];

        foreach ($visitTypes as $type) {
            VisitType::firstOrCreate(['visitType' => $type]);
        }
    }
}
