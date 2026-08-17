<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabMasterTestParameterSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('lab_master_test_parameters')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $getSubHeaderId = function ($name) {
            if (!$name) return null;
            return DB::table('lab_sub_headers')->where('sub_header_name', $name)->value('id');
        };

        $getMasterTestId = function ($serviceCode) {
            $serviceId = DB::table('services')->where('Code', $serviceCode)->value('id');
            if (!$serviceId) return null;
            return DB::table('lab_master_tests')->where('serviceId', $serviceId)->value('id');
        };

        $parameterData = [
            // 1201 CBC
            '1201' => [
                ['name' => 'WBC Count', 'units' => 'x10^3/ul','decimal' => 1, 'range' => '4.0---11.0','printOnReciept' => false, 'sub' => null],
                ['name' => 'Neutrophils', 'units' => '%', 'decimal' => 0, 'range' => '44---70','printOnReciept' => false, 'sub' => 'DLC'],
                ['name' => 'Lymphocytes', 'units' => '%', 'decimal' => 0, 'range' => '22---44','printOnReciept' => false, 'sub' => 'DLC'],
                ['name' => 'Monocytes', 'units' => '%', 'decimal' => 0, 'range' => 'Up to 8','printOnReciept' => false, 'sub' => 'DLC'],
                ['name' => 'Eosinophils', 'units' => '%', 'decimal' => 0, 'range' => 'Up to 10','printOnReciept' => false, 'sub' => 'DLC'],
                ['name' => 'Basophils', 'units' => '%', 'decimal' => 0, 'range' => '0---1','printOnReciept' => false, 'sub' => 'DLC'],
                ['name' => 'RBC Count', 'units' => 'x10^6/ul', 'decimal' => 1, 'range' => '4.0---6.0','printOnReciept' => false, 'sub' => null],
                ['name' => 'Hemoglobin (Hb)', 'units' => 'g/dl', 'decimal' => 1, 'range' => 'M: 13.5---17.5, F: 12.0---16.0','printOnReciept' => false, 'sub' => null],
                ['name' => 'HCT', 'units' => '%', 'decimal' => 1, 'range' => '36---51','printOnReciept' => false, 'sub' => null],
                ['name' => 'MCV', 'units' => 'fl', 'decimal' => 1, 'range' => '78---101','printOnReciept' => false, 'sub' => null],
                ['name' => 'MCH', 'units' => 'pg', 'decimal' => 1, 'range' => '26---34','printOnReciept' => false, 'sub' => null],
                ['name' => 'MCHC', 'units' => 'g/dl', 'decimal' => 1, 'range' => '31---37','printOnReciept' => false, 'sub' => null],
                ['name' => 'Platelets Count', 'units' => 'x10^3/ul', 'decimal' => 0, 'range' => '150---450','printOnReciept' => false, 'sub' => null],
                
            ],

            // 1202 ESR
            '1202' => [
                ['name' => 'ESR', 'units' => 'mm/1st hr', 'decimal' => 0, 'range' => 'Male: 0---15, Female: 0---25','printOnReciept' => false, 'sub' => null],
            ],

            // 1203 Malaria Test
            '1203' => [
                ['name' => 'MP (ICT)', 'default' => 'Negative', 'sub' => null],
                ['name' => 'MP (Slide)', 'default' => 'Not Seen','printOnReciept' => false, 'sub' => null],
            ],

            // 1204 HB
            '1204' => [
                ['name' => 'Hemoglobin', 'units' => 'g/dl', 'decimal' => 1, 'range' => 'M: 13.5---17.5, F: 12.0---16.0','printOnReciept' => false, 'sub' => null],
            ],

            // 1205 TLC
            '1205' => [
                ['name' => 'TLC', 'units' => 'x10^3/ul', 'decimal' => 1, 'range' => '4.0---11.0','printOnReciept' => false, 'sub' => null],
            ],

            // 1206 DLC
            '1206' => [
                ['name' => 'Neutrophils', 'units' => '%', 'decimal' => 0, 'range' => '44---70','printOnReciept' => false, 'sub' => 'DLC'],
                ['name' => 'Lymphocytes', 'units' => '%', 'decimal' => 0, 'range' => '22---44','printOnReciept' => false, 'sub' => 'DLC'],
                ['name' => 'Monocytes', 'units' => '%', 'decimal' => 0, 'range' => 'Up to 8','printOnReciept' => false, 'sub' => 'DLC'],
                ['name' => 'Eosinophils', 'units' => '%', 'decimal' => 0, 'range' => 'Up to 10','printOnReciept' => false, 'sub' => 'DLC'],
                ['name' => 'Basophils', 'units' => '%', 'decimal' => 0, 'range' => '0---1','printOnReciept' => false, 'sub' => 'DLC'],
            ],

            // 1207 Platelet Count
            '1207' => [
                ['name' => 'Platelet Count', 'units' => 'x10^3/ul', 'decimal' => 0, 'range' => '150---450','printOnReciept' => false, 'sub' => null],
            ],

            // 1212 BSF
            '1212' => [
                ['name' => 'Blood Sugar Fasting', 'units' => 'mg/dl', 'decimal' => 0, 'range' => '60---110', 'sub' => null],
            ],

            // 1213 BSR
            '1213' => [
                ['name' => 'Blood Sugar Random', 'units' => 'mg/dl', 'decimal' => 0, 'range' => '60---140', 'sub' => null],
            ],

            // 1214 Blood Urea
            '1214' => [
                ['name' => 'Blood Urea', 'units' => 'mg/dl', 'decimal' => 0, 'range' => '15---45', 'sub' => null],
            ],

            // 1215 Serum Creatinine
            '1215' => [
                ['name' => 'Serum Creatinine', 'units' => 'mg/dl', 'decimal' => 1, 'range' => 'Male: 0.6---1.3, Female: 0.5---1.1', 'sub' => null],
            ],
    
            // 1216 Uric Acid
            '1216' => [
                ['name' => 'Uric Acid', 'units' => 'mg/dl', 'decimal' => 1, 'range' => 'Male: 3.4---7.0, Female: 2.4---5.7', 'sub' => null],
            ],

            // 1217 Bilirubin Total
            '1217' => [
                ['name' => 'Bilirubin Total', 'units' => 'mg/dl', 'decimal' => 1, 'range' => '0.3---1.0', 'sub' => null],
            ],

            // 1218 Bilirubin Direct
            '1218' => [
                ['name' => 'Bilirubin Direct', 'units' => 'mg/dl', 'decimal' => 1, 'range' => 'Up to 0.3', 'sub' => null],
            ],

            // 1219 Bilirubin Indirect
            '1219' => [
                ['name' => 'Bilirubin Indirect', 'units' => 'mg/dl', 'decimal' => 1, 'range' => '0.3---0.7', 'sub' => null],
            ],

            // 1220 ALT / SGPT
            '1220' => [
                ['name' => 'ALT / SGPT', 'units' => 'U/L', 'decimal' => 0, 'range' => 'Male: Up to 41, Female: Up to 31', 'sub' => null],
            ],

            // 1221 AST / SGOT
            '1221' => [
                ['name' => 'AST / SGOT', 'units' => 'U/L', 'decimal' => 0, 'range' => 'Male: Up to 41, Female: Up to 31', 'sub' => null],
            ],

            // 1222 Alkaline Phosphatase
            '1222' => [
                ['name' => 'Alkaline Phosphatase', 'units' => 'U/L', 'decimal' => 0, 'range' => 'Up to 258', 'sub' => null],
            ],

            // 1223 Serum Total Protein
            '1223' => [
                ['name' => 'Serum Total Protein', 'units' => 'g/dl', 'decimal' => 1, 'range' => '5.5---8.0', 'sub' => null],
            ],

            // 1224 Serum Albumin
            '1224' => [
                ['name' => 'Serum Albumin', 'units' => 'g/dl', 'decimal' => 1, 'range' => '3.5---5.5', 'sub' => null],
            ],

            // 1225 Serum Globulin
            '1225' => [
                ['name' => 'Serum Globulin', 'units' => 'g/dl', 'decimal' => 1, 'range' => '2.0---3.5','printOnReciept' => false, 'sub' => null],
            ],

            // 1226 A/G Ratio
            '1226' => [
                ['name' => 'A/G Ratio', 'units' => '', 'decimal' => 1, 'range' => '1.2---2.2','printOnReciept' => false, 'sub' => null],
            ],

            // 1227 Serum Cholesterol
            '1227' => [
                ['name' => 'Serum Cholesterol', 'units' => 'mg/dl', 'decimal' => 0, 'range' => 'Desirable: <200', 'sub' => null],
            ],

            // 1228 Serum Triglyceride
            '1228' => [
                ['name' => 'Serum Triglyceride', 'units' => 'mg/dl', 'decimal' => 0, 'range' => 'Desirable: <150', 'sub' => null],
            ],

            // 1229 Serum HDL
            '1229' => [
                ['name' => 'Serum HDL', 'units' => 'mg/dl', 'decimal' => 0, 'range' => 'Male: >35, Female: >45', 'sub' => null],
            ],

            // 1230 Serum LDL
            '1230' => [
                ['name' => 'Serum LDL', 'units' => 'mg/dl', 'decimal' => 0, 'range' => '<100', 'sub' => null],
            ],

            // 1231 RFTs
            '1231' => [
                ['name' => 'Blood Urea', 'units' => 'mg/dl', 'decimal' => 0, 'range' => '15---45', 'sub' => 'Renal Function Tests'],
                ['name' => 'Serum Creatinine', 'units' => 'mg/dl', 'decimal' => 1, 'range' => 'Male: 0.6---1.3, Female: 0.5---1.1', 'sub' => 'Renal Function Tests'],
            ],

            // 1232 LFTs
            '1232' => [
                ['name' => 'Bilirubin Total', 'units' => 'mg/dl', 'decimal' => 1, 'range' => '0.2---1.0', 'sub' => 'Liver Function Tests'],
                ['name' => 'Bilirubin Direct', 'units' => 'mg/dl', 'decimal' => 1, 'range' => '0.0---0.3', 'sub' => 'Liver Function Tests'],
                ['name' => 'Bilirubin Indirect', 'units' => 'mg/dl', 'decimal' => 1, 'range' => '0.2---0.7', 'sub' => 'Liver Function Tests'],
                ['name' => 'ALT / SGPT', 'units' => 'U/L', 'decimal' => 0, 'range' => 'Male: Up to 41, Female: Up to 31', 'sub' => 'Liver Function Tests'],
                ['name' => 'AST / SGOT', 'units' => 'U/L', 'decimal' => 0, 'range' => 'Male: Up to 41, Female: Up to 31', 'sub' => 'Liver Function Tests'],
                ['name' => 'Alkaline Phosphatase', 'units' => 'U/L', 'decimal' => 0, 'range' => 'Up to 258', 'sub' => 'Liver Function Tests'],
                ['name' => 'Serum Total Protein', 'units' => 'g/dl', 'decimal' => 1, 'range' => '5.5---8.0', 'sub' => 'Liver Function Tests'],
                ['name' => 'Serum Albumin', 'units' => 'g/dl', 'decimal' => 1, 'range' => '3.5---5.5', 'sub' => 'Liver Function Tests'],
                ['name' => 'Serum Globulin', 'units' => 'g/dl', 'decimal' => 1, 'range' => '2.0---3.5','printOnReciept' => false, 'sub' => 'Liver Function Tests'],
                ['name' => 'A/G Ratio', 'units' => '', 'decimal' => 1, 'range' => '1.2---2.2','printOnReciept' => false, 'sub' => 'Liver Function Tests'],
            ],

            // 1233 Lipid Profile
            '1233' => [
                ['name' => 'Serum Cholesterol', 'units' => 'mg/dl', 'decimal' => 0, 'range' => 'Desirable: <200', 'sub' => 'Lipid Profile'],
                ['name' => 'Serum Triglycerides', 'units' => 'mg/dl', 'decimal' => 0, 'range' => 'Desirable: <150', 'sub' => 'Lipid Profile'],
                ['name' => 'HDL Cholesterol', 'units' => 'mg/dl', 'decimal' => 0, 'range' => 'Male: >40, Female: >50', 'sub' => 'Lipid Profile'],
                ['name' => 'LDL Cholesterol', 'units' => 'mg/dl', 'decimal' => 0, 'range' => '<100', 'sub' => 'Lipid Profile'],
                ['name' => 'VLDL Cholesterol', 'units' => 'mg/dl', 'decimal' => 0, 'range' => '5---40','printOnReciept' => false, 'sub' => 'Lipid Profile'],
                ['name' => 'Cholesterol/HDL Ratio', 'units' => '', 'decimal' => 1, 'range' => '<4.5','printOnReciept' => false, 'sub' => 'Lipid Profile'],
            ],

            // 1234 Blood Group
            '1234' => [
                ['name' => 'Blood Group', 'units' => '', 'decimal' => 0, 'range' => '', 'sub' => null],
                ['name' => 'Rh Factor', 'units' => '', 'decimal' => 0, 'range' => '','printOnReciept' => false, 'sub' => null],
            ],

            // 1235 Urine R/E
            '1235' => [
                ['name' => 'Color', 'default' => 'Pale Yellow','printOnReciept' => false, 'sub' => 'Physical Examination'],
                ['name' => 'Appearance', 'default' => 'Clear','printOnReciept' => false, 'sub' => 'Physical Examination'],
                ['name' => 'pH','default' => '6.0','range' => '4.6---8.0','printOnReciept' => false, 'sub' => 'Chemical Examination'],
                ['name' => 'Protein', 'default' => 'Nil','printOnReciept' => false, 'sub' => 'Chemical Examination'],
                ['name' => 'Sugar', 'default' => 'Nil','printOnReciept' => false, 'sub' => 'Chemical Examination'],
                ['name' => 'Ketone', 'default' => 'Nil','printOnReciept' => false, 'sub' => 'Chemical Examination'],
                ['name' => 'Urobilinogen', 'default' => 'Normal','printOnReciept' => false, 'sub' => 'Chemical Examination'],
                ['name' => 'Bilirubin', 'default' => 'Negative','printOnReciept' => false, 'sub' => 'Chemical Examination'],
                ['name' => 'Blood', 'default' => 'Nil','printOnReciept' => false, 'sub' => 'Chemical Examination'],
                ['name' => 'Sp. Gravity', 'default' => '1.020','printOnReciept' => false, 'sub' => 'Chemical Examination'],
                ['name' => 'Nitrite', 'default' => 'Negative','printOnReciept' => false, 'sub' => 'Chemical Examination'],
                ['name' => 'Pus Cells', 'units' => '/HPF', 'range' => '', 'sub' => 'Microscopic Examination'],
                ['name' => 'RBCs', 'units' => '/HPF', 'range' => '', 'sub' => 'Microscopic Examination'],
                ['name' => 'Epithelial Cells', 'units' => '/HPF', 'range' => '', 'sub' => 'Microscopic Examination'],
                ['name' => 'Casts', 'default' => '','printOnReciept' => false, 'sub' => 'Microscopic Examination'],
                ['name' => 'Crystals', 'default' => '', 'printOnReciept' => false, 'sub' => 'Microscopic Examination'],
                ['name' => 'Miscellaneous', 'default' => '', 'printOnReciept' => false, 'sub' => 'Microscopic Examination'],
            ],

            // 1236 Stool R/E
            '1236' => [
                ['name' => 'Color', 'default' => 'Brownish','printOnReciept' => false, 'sub' => 'Physical Examination'],
                ['name' => 'Consistency', 'default' => 'Semi-Formed','printOnReciept' => false, 'sub' => 'Physical Examination'],
                ['name' => 'Mucus', 'default' => 'Absent', 'printOnReciept' => false, 'sub' => 'Physical Examination'],
                ['name' => 'PH', 'default' => 'Acidic', 'printOnReciept' => false, 'sub' => 'Chemical Examination'],
                ['name' => 'Sugar', 'default' => 'Nil', 'printOnReciept' => false, 'sub' => 'Chemical Examination'],
                ['name' => 'Pus Cells', 'units' => '/HPF', 'range' => '', 'printOnReciept' => false, 'sub' => 'Microscopic Examination'],
                ['name' => 'RBCs', 'units' => '/HPF', 'range' => '', 'printOnReciept' => false, 'sub' => 'Microscopic Examination'],
                ['name' => 'Ova / Cysts', 'default' => 'Not Seen', 'printOnReciept' => false, 'sub' => 'Microscopic Examination'],
                ['name' => 'Flagelates', 'default' => 'Not Seen', 'printOnReciept' => false, 'sub' => 'Microscopic Examination'],
            ],

            // 1237 Pregnancy Test
            '1237' => [
                ['name' => 'Pregnancy test', 'default' => '', 'range' => '', 'printOnReciept' => false, 'sub' => null],
            ],

            // 1238 Widal Test
            '1238' => [
                ['name' => 'Salmonella Typhi "O"', 'range' => '< 1:80',  'sub' => 'Widal Test'],
                ['name' => 'Salmonella Typhi "H"', 'range' => '< 1:80',  'sub' => 'Widal Test'],
                
            ],

            // 1239 HBsAg
            '1239' => [
                ['name' => 'HBsAg (Rapid)', 'default' => 'Negative', 'range' => '', 'sub' => null],
            ],

            // 1240 Anti-HCV
            '1240' => [
                ['name' => 'Anti-HCV (Rapid)', 'default' => 'Negative', 'range' => '', 'sub' => null],
            ],

            // 1241 HIV
            '1241' => [
                ['name' => 'HIV I & II', 'default' => 'Negative', 'range' => '', 'sub' => null],
            ],

            // 1242 VDRL
            '1242' => [
                ['name' => 'VDRL', 'default' => 'Negative', 'range' => '', 'sub' => null],
            ],

            // 1243 CRP
            '1243' => [
                ['name' => 'CRP', 'units' => 'mg/L', 'range' => 'Up to 6.0', 'sub' => null],
            ],

            // 1245 Electrolytes
            '1245' => [
                ['name' => 'Sodium (Na+)', 'units' => 'mEq/L','decimal' => 1, 'range' => '135---145', 'sub' => 'Electrolytes'],
                ['name' => 'Potassium (K+)', 'units' => 'mEq/L', 'decimal' => 1, 'range' => '3.5---5.1', 'sub' => 'Electrolytes'],
                ['name' => 'Chloride (Cl-)', 'units' => 'mEq/L', 'decimal' => 1, 'range' => '98---107', 'sub' => 'Electrolytes'],
            ],

            // 1246 Calcium
            '1246' => [
                ['name' => 'Serum Calcium', 'units' => 'mg/dl', 'decimal' => 1, 'range' => '8.5---10.5', 'sub' => null],
            ],

            // 1247 Phosphorus
            '1247' => [
                ['name' => 'Serum Phosphorus', 'units' => 'mg/dl', 'decimal' => 1, 'range' => '2.5---4.5', 'sub' => null],
            ],

            // 1248 Magnesium
            '1248' => [
                ['name' => 'Serum Magnesium', 'units' => 'mg/dl', 'decimal' => 1, 'range' => '1.7---2.2', 'sub' => null],
            ],

            // 1249 PT / INR
            '1249' => [
                ['name' => 'PT', 'units' => 'Sec', 'decimal' => 0, 'range' => '11---14', 'sub' => null],
                ['name' => 'INR', 'units' => '', 'decimal' => 1, 'range' => '0.9---1.2','printOnReciept' => false, 'sub' => null],
            ],

            // 1250 APTT
            '1250' => [
                ['name' => 'APTT', 'units' => 'Sec', 'decimal' => 0, 'range' => '24---44', 'sub' => null],
            ],

            // 1251 Blood Culture
            '1251' => [
                ['name' => 'Organism Isolated', 'default' => 'No Growth After 72 Hours', 'printOnReciept' => false, 'sub' => null],
            ],

            // 1252 Urine Culture
            '1252' => [
                ['name' => 'Organism Isolated', 'default' => 'No Growth After 48 Hours', 'printOnReciept' => false, 'sub' => null],
            ],

            // 1253 Sputum AFB
            '1253' => [
                ['name' => 'AFB Smear', 'default' => 'Negative for AFB', 'range' => '', 'printOnReciept' => false, 'sub' => null],
            ],

            // 1254 Dengue NS1
            '1254' => [
                ['name' => 'Dengue NS1 Ag', 'default' => 'Negative', 'range' => '', 'sub' => 'Dengue Test'],
            ],

            // 1255 Dengue IgM / IgG
            '1255' => [
                ['name' => 'Dengue IgM', 'default' => 'Negative', 'range' => '', 'sub' => 'Dengue Test'],
                ['name' => 'Dengue IgG', 'default' => 'Negative', 'range' => '', 'sub' => 'Dengue Test'],
            ],

            // 1256 Typhidot IgM / IgG
            '1256' => [
                ['name' => 'Typhidot IgM', 'default' => 'Negative', 'range' => '', 'sub' => 'Typhoid Test'],
                ['name' => 'Typhidot IgG', 'default' => 'Negative', 'range' => '', 'sub' => 'Typhoid Test'],
            ],

            // 1257 Covid-19
            '1257' => [
                ['name' => 'SARS-CoV-2 Ag', 'default' => 'Negative', 'range' => '','printOnReciept' => false, 'sub' => null],
            ],

            // 1258 Semen Analysis
            '1258' => [
                
                ['name' => 'Color', 'units' => '', 'range' => '','printOnReciept' => false, 'sub' => 'Physical Examination'],
                ['name' => 'Volume', 'units' => 'ml', 'decimal' => 1, 'range' => '>= 1.5', 'sub' => 'Physical Examination'],
                ['name' => 'Consistency', 'units' => '', 'range' => '', 'sub' => 'Physical Examination'],
                ['name' => 'pH', 'range' => '7.2---8.0', 'sub' => 'Physical Examination'],
                ['name' => 'Liquefaction Time', 'units' => '', 'range' => '', 'sub' => 'Physical Examination'],
                ['name' => 'Abstinence', 'units' => '', 'range' => '', 'sub' => 'Physical Examination'],
                ['name' => 'Sperm Concentration', 'units' => '', 'range' => '', 'sub' => 'Microscopic Examination'],
                ['name' => 'Total Motility', 'units' => '%', 'decimal' => 0, 'range' => '>= 40', 'sub' => 'Motility'],
                ['name' => 'Immotile', 'units' => '%', 'decimal' => 0, 'range' => '', 'sub' => 'Motility'],
                ['name' => 'Progressive Motility', 'units' => '%', 'decimal' => 0, 'range' => '>= 32', 'sub' => 'Progressive Motility'],
                ['name' => 'Non Progressive Motility', 'units' => '%', 'decimal' => 0, 'range' => '', 'sub' => 'Progressive Motility'],
                ['name' => 'Normal', 'units' => '%','decimal' => 0,  'range' => 'WHO standard of crugar strict criteria 4% or greater is Normal', 'sub' => 'Morphology'],
                ['name' => 'Abnormal', 'units' => '%', 'decimal' => 0, 'range' => '','printOnReciept' => false, 'sub' => 'Morphology'],
                ['name' => 'WBCs', 'units' => '/HPF', 'decimal' => 0, 'range' => '','printOnReciept' => false, 'sub' => 'Microscopic Examination'],
                ['name' => 'RBCs', 'units' => '/HPF', 'decimal' => 0, 'range' => '','printOnReciept' => false, 'sub' => 'Microscopic Examination'],
            ],

            // 1259 RA Factor
            '1259' => [
                ['name' => 'RA Factor', 'units' => 'IU/ml', 'range' => '< 8', 'sub' => null],
            ],

            // 1260 ANA
            '1260' => [
                ['name' => 'ANA (Rapid)', 'default' => 'Negative', 'range' => '', 'sub' => null],
            ],

            // 1261 H.Pylori Ab
            '1261' => [
                ['name' => 'H.Pylori Ab', 'default' => 'Negative', 'range' => '', 'sub' => null],
            ],

            // 1264 CPK
            '1264' => [
                ['name' => 'CPK Total', 'units' => 'U/L', 'range' => 'Male: 24---195, Female: 24---170', 'sub' => null],
            ],

            // 1265 CK MB
            '1265' => [
                ['name' => 'CK-MB', 'units' => 'U/L', 'range' => 'Up to 24', 'sub' => null],
            ],
        ];

        foreach ($parameterData as $serviceCode => $params) {
            $masterTestId = $getMasterTestId($serviceCode);
            if (!$masterTestId) continue;

            $sortNo = 1;
            foreach ($params as $p) {
                $subHeaderId = isset($p['sub']) ? $getSubHeaderId($p['sub']) : null;

                DB::table('lab_master_test_parameters')->insert([
                    'id' => Str::uuid(),
                    'master_test_id' => $masterTestId,
                    'sub_headers_id' => $subHeaderId,
                    'parameterName' => $p['name'],
                    'defaultValue' => $p['default'] ?? null,
                    'units' => $p['units'] ?? null,
                    'decimal' => $p['decimal'] ?? 0,
                    'normalRange' => $p['range'] ?? null,
                    'sortNo' => $sortNo++,
                    'printOnReciept' => $p['printOnReciept'] ?? true,
                    'isActive' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
