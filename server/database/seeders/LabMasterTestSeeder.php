<?php

namespace Database\Seeders;

use App\Models\LabMasterTest;
use App\Models\LabRequiredSample;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabMasterTestSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        LabMasterTest::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $edta = LabRequiredSample::where('required_sample_name', '3 cc EDTA Blood (CBC Vial)')->first()?->id;
        $clotted = LabRequiredSample::where('required_sample_name', '3-5 cc Clotted Blood or Serum')->first()?->id;
        $citrated = LabRequiredSample::where('required_sample_name', 'Sodium Citrate Blood (Coagulation Vial)')->first()?->id;
        $urine = LabRequiredSample::where('required_sample_name', 'Sport Urine')->first()?->id;
        $stool = LabRequiredSample::where('required_sample_name', 'Stool')->first()?->id;
        $csf = LabRequiredSample::where('required_sample_name', 'CSF')->first()?->id;
        $ascitic = LabRequiredSample::where('required_sample_name', 'Ascitic Fluid')->first()?->id;
        $pleural = LabRequiredSample::where('required_sample_name', 'Pleural Fluid')->first()?->id;
        $synovial = LabRequiredSample::where('required_sample_name', 'Synovial Fluid')->first()?->id;
        $sputum = LabRequiredSample::where('required_sample_name', 'Sputum')->first()?->id;
        $seminal = LabRequiredSample::where('required_sample_name', 'Seminal Fluid')->first()?->id;
        $swab = LabRequiredSample::where('required_sample_name', 'Swab')->first()?->id;

        $getServiceId = function ($code) {
            $service = DB::table('services')->where('Code', $code)->first();
            return $service?->id;
        };

        $tests = [
            ['serviceCode' => '1201', 'lab_required_sample_id' => $edta, 'testSort' => 1, 'expectedTime' => '60'],
            ['serviceCode' => '1202', 'lab_required_sample_id' => $edta, 'testSort' => 2, 'expectedTime' => '60'],
            ['serviceCode' => '1203', 'lab_required_sample_id' => $edta, 'testSort' => 3, 'expectedTime' => '30'],
            ['serviceCode' => '1204', 'lab_required_sample_id' => $edta, 'testSort' => 4, 'expectedTime' => '30'],
            ['serviceCode' => '1205', 'lab_required_sample_id' => $edta, 'testSort' => 5, 'expectedTime' => '30'],
            ['serviceCode' => '1206', 'lab_required_sample_id' => $edta, 'testSort' => 6, 'expectedTime' => '30'],
            ['serviceCode' => '1207', 'lab_required_sample_id' => $edta, 'testSort' => 7, 'expectedTime' => '30'],
            ['serviceCode' => '1208', 'lab_required_sample_id' => $edta, 'testSort' => 8, 'expectedTime' => '30'],
            ['serviceCode' => '1209', 'lab_required_sample_id' => $edta, 'testSort' => 9, 'expectedTime' => '30'],
            ['serviceCode' => '1210', 'lab_required_sample_id' => $edta, 'testSort' => 10, 'expectedTime' => '30'],
            ['serviceCode' => '1211', 'lab_required_sample_id' => $clotted, 'testSort' => 11, 'expectedTime' => '30'],
            ['serviceCode' => '1212', 'lab_required_sample_id' => $clotted, 'testSort' => 12, 'expectedTime' => '15'],
            ['serviceCode' => '1213', 'lab_required_sample_id' => $clotted, 'testSort' => 13, 'expectedTime' => '15'],
            ['serviceCode' => '1214', 'lab_required_sample_id' => $clotted, 'testSort' => 14, 'expectedTime' => '30'],
            ['serviceCode' => '1215', 'lab_required_sample_id' => $clotted, 'testSort' => 15, 'expectedTime' => '30'],
            ['serviceCode' => '1216', 'lab_required_sample_id' => $clotted, 'testSort' => 16, 'expectedTime' => '30'],
            ['serviceCode' => '1217', 'lab_required_sample_id' => $clotted, 'testSort' => 17, 'expectedTime' => '30'],
            ['serviceCode' => '1218', 'lab_required_sample_id' => $clotted, 'testSort' => 18, 'expectedTime' => '30'],
            ['serviceCode' => '1219', 'lab_required_sample_id' => $clotted, 'testSort' => 19, 'expectedTime' => '30'],
            ['serviceCode' => '1220', 'lab_required_sample_id' => $clotted, 'testSort' => 20, 'expectedTime' => '30'],
            ['serviceCode' => '1221', 'lab_required_sample_id' => $clotted, 'testSort' => 21, 'expectedTime' => '30'],
            ['serviceCode' => '1222', 'lab_required_sample_id' => $clotted, 'testSort' => 22, 'expectedTime' => '60'],
            ['serviceCode' => '1223', 'lab_required_sample_id' => $clotted, 'testSort' => 23, 'expectedTime' => '60'],
            ['serviceCode' => '1224', 'lab_required_sample_id' => $clotted, 'testSort' => 24, 'expectedTime' => '60'],
            ['serviceCode' => '1225', 'lab_required_sample_id' => $clotted, 'testSort' => 25, 'expectedTime' => '60'],
            ['serviceCode' => '1226', 'lab_required_sample_id' => $clotted, 'testSort' => 26, 'expectedTime' => '60'],
            ['serviceCode' => '1227', 'lab_required_sample_id' => $clotted, 'testSort' => 27, 'expectedTime' => '30'],
            ['serviceCode' => '1228', 'lab_required_sample_id' => $clotted, 'testSort' => 28, 'expectedTime' => '30'],
            ['serviceCode' => '1229', 'lab_required_sample_id' => $clotted, 'testSort' => 29, 'expectedTime' => '30'],
            ['serviceCode' => '1230', 'lab_required_sample_id' => $clotted, 'testSort' => 30, 'expectedTime' => '30'],
            ['serviceCode' => '1231', 'lab_required_sample_id' => $clotted, 'testSort' => 31, 'expectedTime' => '120'],
            ['serviceCode' => '1232', 'lab_required_sample_id' => $clotted, 'testSort' => 32, 'expectedTime' => '120'],
            ['serviceCode' => '1233', 'lab_required_sample_id' => $clotted, 'testSort' => 33, 'expectedTime' => '60'],
            ['serviceCode' => '1234', 'lab_required_sample_id' => $edta, 'testSort' => 34, 'expectedTime' => '15'],
            ['serviceCode' => '1235', 'lab_required_sample_id' => $urine, 'testSort' => 35, 'expectedTime' => '30'],
            ['serviceCode' => '1236', 'lab_required_sample_id' => $stool, 'testSort' => 36, 'expectedTime' => '30'],
            ['serviceCode' => '1237', 'lab_required_sample_id' => $urine, 'testSort' => 37, 'expectedTime' => '15'],
            ['serviceCode' => '1238', 'lab_required_sample_id' => $clotted, 'testSort' => 38, 'expectedTime' => '60'],
            ['serviceCode' => '1239', 'lab_required_sample_id' => $clotted, 'testSort' => 39, 'expectedTime' => '120'],
            ['serviceCode' => '1240', 'lab_required_sample_id' => $clotted, 'testSort' => 40, 'expectedTime' => '120'],
            ['serviceCode' => '1241', 'lab_required_sample_id' => $clotted, 'testSort' => 41, 'expectedTime' => '120'],
            ['serviceCode' => '1242', 'lab_required_sample_id' => $clotted, 'testSort' => 42, 'expectedTime' => '60'],
            ['serviceCode' => '1243', 'lab_required_sample_id' => $clotted, 'testSort' => 43, 'expectedTime' => '60'],
            ['serviceCode' => '1244', 'lab_required_sample_id' => $clotted, 'testSort' => 44, 'expectedTime' => '60'],
            ['serviceCode' => '1245', 'lab_required_sample_id' => $clotted, 'testSort' => 45, 'expectedTime' => '30'],
            ['serviceCode' => '1246', 'lab_required_sample_id' => $clotted, 'testSort' => 46, 'expectedTime' => '30'],
            ['serviceCode' => '1247', 'lab_required_sample_id' => $clotted, 'testSort' => 47, 'expectedTime' => '30'],
            ['serviceCode' => '1248', 'lab_required_sample_id' => $clotted, 'testSort' => 48, 'expectedTime' => '30'],
            ['serviceCode' => '1249', 'lab_required_sample_id' => $citrated, 'testSort' => 49, 'expectedTime' => '30'],
            ['serviceCode' => '1250', 'lab_required_sample_id' => $citrated, 'testSort' => 50, 'expectedTime' => '30'],
            ['serviceCode' => '1251', 'lab_required_sample_id' => $clotted, 'testSort' => 51, 'expectedTime' => '1440'],
            ['serviceCode' => '1252', 'lab_required_sample_id' => $urine, 'testSort' => 52, 'expectedTime' => '1440'],
            ['serviceCode' => '1253', 'lab_required_sample_id' => $sputum, 'testSort' => 53, 'expectedTime' => '60'],
            ['serviceCode' => '1254', 'lab_required_sample_id' => $clotted, 'testSort' => 54, 'expectedTime' => '60'],
            ['serviceCode' => '1255', 'lab_required_sample_id' => $clotted, 'testSort' => 55, 'expectedTime' => '120'],
            ['serviceCode' => '1256', 'lab_required_sample_id' => $clotted, 'testSort' => 56, 'expectedTime' => '60'],
            ['serviceCode' => '1257', 'lab_required_sample_id' => $swab, 'testSort' => 57, 'expectedTime' => '15'],
            ['serviceCode' => '1258', 'lab_required_sample_id' => $seminal, 'testSort' => 58, 'expectedTime' => '60'],
            ['serviceCode' => '1259', 'lab_required_sample_id' => $clotted, 'testSort' => 59, 'expectedTime' => '120'],
            ['serviceCode' => '1260', 'lab_required_sample_id' => $clotted, 'testSort' => 60, 'expectedTime' => '120'],
            ['serviceCode' => '1261', 'lab_required_sample_id' => $clotted, 'testSort' => 61, 'expectedTime' => '60'],
            ['serviceCode' => '1262', 'lab_required_sample_id' => $clotted, 'testSort' => 62, 'expectedTime' => '60'],
            ['serviceCode' => '1263', 'lab_required_sample_id' => $clotted, 'testSort' => 63, 'expectedTime' => '60'],
            ['serviceCode' => '1264', 'lab_required_sample_id' => $clotted, 'testSort' => 64, 'expectedTime' => '60'],
            ['serviceCode' => '1265', 'lab_required_sample_id' => $clotted, 'testSort' => 65, 'expectedTime' => '60'],
            ['serviceCode' => '1266', 'lab_required_sample_id' => $clotted, 'testSort' => 66, 'expectedTime' => '60'],
            ['serviceCode' => '1267', 'lab_required_sample_id' => $clotted, 'testSort' => 67, 'expectedTime' => '60'],
            ['serviceCode' => '1268', 'lab_required_sample_id' => $pleural, 'testSort' => 68, 'expectedTime' => '60'],
            ['serviceCode' => '1269', 'lab_required_sample_id' => $ascitic, 'testSort' => 69, 'expectedTime' => '60'],
            ['serviceCode' => '1270', 'lab_required_sample_id' => $synovial, 'testSort' => 70, 'expectedTime' => '60'],
            ['serviceCode' => '1271', 'lab_required_sample_id' => $csf, 'testSort' => 71, 'expectedTime' => '60'],
            ['serviceCode' => '1272', 'lab_required_sample_id' => $edta, 'testSort' => 72, 'expectedTime' => '60'],
            ['serviceCode' => '1273', 'lab_required_sample_id' => $clotted, 'testSort' => 73, 'expectedTime' => '60'],
            ['serviceCode' => '1274', 'lab_required_sample_id' => $clotted, 'testSort' => 74, 'expectedTime' => '120'],
            ['serviceCode' => '1275', 'lab_required_sample_id' => $clotted, 'testSort' => 75, 'expectedTime' => '120'],
            ['serviceCode' => '1276', 'lab_required_sample_id' => $clotted, 'testSort' => 76, 'expectedTime' => '120'],
            ['serviceCode' => '1277', 'lab_required_sample_id' => $clotted, 'testSort' => 77, 'expectedTime' => '120'],
            ['serviceCode' => '1278', 'lab_required_sample_id' => $clotted, 'testSort' => 78, 'expectedTime' => '120'],
            ['serviceCode' => '1279', 'lab_required_sample_id' => $clotted, 'testSort' => 79, 'expectedTime' => '120'],
            ['serviceCode' => '1280', 'lab_required_sample_id' => $clotted, 'testSort' => 80, 'expectedTime' => '120'],
            ['serviceCode' => '1281', 'lab_required_sample_id' => $clotted, 'testSort' => 81, 'expectedTime' => '120'],
            ['serviceCode' => '1282', 'lab_required_sample_id' => $clotted, 'testSort' => 82, 'expectedTime' => '60'],
            ['serviceCode' => '1283', 'lab_required_sample_id' => $clotted, 'testSort' => 83, 'expectedTime' => '60'],
        ];

        $getHeaderId = function ($name) {
            return DB::table('lab_headers')->where('header_name', $name)->value('id');
        };

        $hematology = $getHeaderId('Hematology');
        $biochemistry = $getHeaderId('Biochemistry');
        $serology = $getHeaderId('Serology');
        $clinicalPathology = $getHeaderId('Clinical Pathology');
        $microbiology = $getHeaderId('Microbiology');
        $endocrinology = $getHeaderId('Endocrinology');

        $getHeaderForCode = function ($codeNum) use (
            $hematology,
            $biochemistry,
            $serology,
            $clinicalPathology,
            $microbiology,
            $endocrinology
        ) {
            if (($codeNum >= 1201 && $codeNum <= 1211) || in_array($codeNum, [1234, 1249, 1250, 1262, 1263, 1272])) {
                return $hematology;
            }
            if (($codeNum >= 1212 && $codeNum <= 1233) || ($codeNum >= 1245 && $codeNum <= 1248) || in_array($codeNum, [1264, 1265, 1266, 1267])) {
                return $biochemistry;
            }
            if (in_array($codeNum, [1235, 1236, 1237, 1258, 1268, 1269, 1270, 1271])) {
                return $clinicalPathology;
            }
            if (($codeNum >= 1238 && $codeNum <= 1244) || ($codeNum >= 1254 && $codeNum <= 1257) || in_array($codeNum, [1259, 1260, 1261])) {
                return $serology;
            }
            if (in_array($codeNum, [1251, 1252, 1253])) {
                return $microbiology;
            }
            if ($codeNum >= 1273 && $codeNum <= 1283) {
                return $endocrinology;
            }
            return $biochemistry;
        };

        foreach ($tests as $test) {
            $serviceId = $getServiceId($test['serviceCode']);
            if (!$serviceId) continue;

            $codeNum = intval($test['serviceCode']);
            $headerId = $getHeaderForCode($codeNum);

            DB::table('lab_master_tests')->insert([
                'id' => Str::uuid(),
                'serviceId' => $serviceId,
                'lab_headers_id' => $headerId,
                'lab_required_sample_id' => $test['lab_required_sample_id'],
                'testSort' => $test['testSort'],
                'expectedTime' => $test['expectedTime'],
                'isActive' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
