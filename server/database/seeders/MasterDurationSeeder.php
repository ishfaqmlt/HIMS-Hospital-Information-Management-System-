<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterDurationSeeder extends Seeder
{
    public function run(): void
    {
        $durations = [
            // Standard English Clinical Terms
            '1 Day',
            '2 Days',
            '3 Days',
            '4 Days',
            '5 Days',
            '7 Days (1 Week)',
            '10 Days',
            '14 Days (2 Weeks)',
            '21 Days (3 Weeks)',
            '1 Month (30 Days)',
            '2 Months',
            '3 Months',
            '6 Months',
            'Continue / Long Term',
            'Till Next Visit',
            'As Directed',

            // Standard Urdu Clinical Terms
            '۱ دن (1 Day)',
            '۲ دن (2 Days)',
            '۳ دن (3 Days)',
            '۴ دن (4 Days)',
            '۵ دن (5 Days)',
            '۷ دن / ایک ہفتہ (1 Week)',
            '۱۰ دن (10 Days)',
            'دو ہفتے (2 Weeks)',
            'تین ہفتے (3 Weeks)',
            'ایک ماہ (1 Month)',
            'دو ماہ (2 Months)',
            'تین ماہ (3 Months)',
            'چھ ماہ (6 Months)',
            'اگلی وزٹ تک',
            'مسلسل جاری رکھیں',
            'حسبِ ہدایت',
        ];

        foreach ($durations as $dur) {
            $trimmed = trim($dur);
            $exists = DB::table('master_durations')->where('duration', $trimmed)->exists();
            if (!$exists) {
                DB::table('master_durations')->insert([
                    'id' => (string) Str::uuid(),
                    'duration' => $trimmed,
                    'isSynced' => false,
                    'isActive' => true,
                ]);
            }
        }
    }
}
