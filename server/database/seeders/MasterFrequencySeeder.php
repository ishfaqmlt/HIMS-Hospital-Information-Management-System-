<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterFrequencySeeder extends Seeder
{
    public function run(): void
    {
        $frequencies = [
            // Standard Numerical Clinical Formats
            '1-0-1',
            '1-1-1',
            '1-0-0',
            '0-0-1',
            '0-1-0',
            '2-0-2',
            '1-0-1-1',
            '2-2-2',
            '1/2-0-1/2',

            // Standard Medical Latin / English Abbreviations
            'OD (Once Daily)',
            'BD (Twice Daily)',
            'TDS (Three Times Daily)',
            'QID (Four Times Daily)',
            'HS (At Bedtime)',
            'PRN / SOS (As Needed)',
            'STAT (Immediately)',
            'Alternate Day',
            'Weekly Once',
            'Every 4 Hours',
            'Every 6 Hours',
            'Every 8 Hours',
            'Every 12 Hours',

            // Common Clinical Urdu Phrasings
            'صبح، شام',
            'صبح، دوپہر، شام',
            'صبح نہار منہ',
            'رات کو سوتے وقت',
            'دن میں ایک بار',
            'دن میں دو بار',
            'دن میں تین بار',
            'دن میں چار بار',
            'ضرورت کے وقت (حسبِ ضرورت)',
            'درد کی صورت میں',
            'بخار کی صورت میں',
            'کھانسی کی صورت میں',
            'الٹی یا متلی کی صورت میں',
            'ایک دن چھوڑ کر',
            'ہفتے میں ایک بار',
            'ہر ۴ گھنٹے بعد',
            'ہر ۶ گھنٹے بعد',
            'ہر ۸ گھنٹے بعد',
        ];

        foreach ($frequencies as $freq) {
            $trimmed = trim($freq);
            $exists = DB::table('master_frequency')->where('frequency', $trimmed)->exists();
            if (!$exists) {
                DB::table('master_frequency')->insert([
                    'id' => (string) Str::uuid(),
                    'frequency' => $trimmed,
                    'isSynced' => false,
                    'isActive' => true,
                ]);
            }
        }
    }
}
