<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterInstructionSeeder extends Seeder
{
    public function run(): void
    {
        $instructions = [
            // Standard English Clinical Instructions
            'After meals',
            'Before meals',
            'With meals',
            'On empty stomach',
            'At bedtime',
            'With a full glass of water',
            'With milk',
            'Do not chew or crush',
            'Chew thoroughly before swallowing',
            'Dissolve in water before taking',
            'Shake well before use',
            'For external use only',
            'Apply on affected area',
            'Avoid dairy products within 2 hours',
            'Take with food to prevent stomach upset',
            'Do not stop taking without consulting doctor',
            'Drink plenty of fluids',
            'Apply 2 drops in affected eye/ear',
            'Rinse mouth thoroughly after use',
            'Inhale as directed with spacer',
            'Keep in refrigerator (Do not freeze)',

            // Common Clinical Urdu Instructions
            'کھانے کے بعد',
            'کھانے سے پہلے',
            'نہار منہ (خالی پیٹ)',
            'کھانے کے درمیان',
            'رات کو سوتے وقت',
            'پانی کے ساتھ لیں',
            'نیم گرم پانی کے ساتھ',
            'دودھ کے ساتھ لیں',
            'چبائے بغیر نگل لیں',
            'چبا کر کھائیں',
            'شربت اچھی طرح ہلا کر استعمال کریں',
            'پانی میں گھول کر پیئیں',
            'صرف بیرونی استعمال کے لیے',
            'متاثرہ جگہ پر لگائیں',
            'دو قطرے متاثرہ آنکھ / کان میں ڈالیں',
            'استعمال کے بعد اچھی طرح کلی کریں',
            'ضرورت پڑنے پر استعمال کریں',
            'ڈاکٹر کے مشورے کے بغیر دوا بند نہ کریں',
            'زیادہ مقدار میں پانی پیئیں',
            'فریج میں رکھیں (جمائیں نہیں)',
        ];

        foreach ($instructions as $inst) {
            $trimmed = trim($inst);
            $exists = DB::table('master_instructions')->where('instruction', $trimmed)->exists();
            if (!$exists) {
                DB::table('master_instructions')->insert([
                    'id' => (string) Str::uuid(),
                    'instruction' => $trimmed,
                    'isSynced' => false,
                    'isActive' => true,
                ]);
            }
        }
    }
}
