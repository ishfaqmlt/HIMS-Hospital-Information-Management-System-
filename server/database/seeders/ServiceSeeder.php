<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\Department;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::pluck('id', 'DepartmentName');

        $services = [
            // OPD
            ['Code' => '401', 'DepartmentName' => 'OPD', 'ServiceName' => 'Consultation Fee', 'DefaultCharges' => 500, 'printToken' => true],
            ['Code' => '402', 'DepartmentName' => 'OPD', 'ServiceName' => 'Follow Up', 'DefaultCharges' => 300, 'printToken' => true],

            // ECG (Department)
            ['Code' => '501', 'DepartmentName' => 'ECG', 'ServiceName' => 'ECG', 'DefaultCharges' => 300],
            ['Code' => '502', 'DepartmentName' => 'ECG', 'ServiceName' => 'ECHO', 'DefaultCharges' => 1500],
            ['Code' => '503', 'DepartmentName' => 'ECG', 'ServiceName' => 'Angiography', 'DefaultCharges' => 50000],
            ['Code' => '504', 'DepartmentName' => 'ECG', 'ServiceName' => 'Angioplasty', 'DefaultCharges' => 50000],

            // Indoor
            ['Code' => '601', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Bed Charges', 'DefaultCharges' => 5000],
            ['Code' => '602', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Admission Fee', 'DefaultCharges' => 200],
            ['Code' => '603', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Appendix', 'DefaultCharges' => 35000],
            ['Code' => '604', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Left Inguinal Hernia', 'DefaultCharges' => 35000],
            ['Code' => '605', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Right Inguinal Hernia', 'DefaultCharges' => 35000],
            ['Code' => '606', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Cholecystectomy', 'DefaultCharges' => 35000],
            ['Code' => '607', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Cesarean Section', 'DefaultCharges' => 50000],

            // Laboratory
            ['Code' => '1201', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'CBC', 'DefaultCharges' => 800],
            ['Code' => '1202', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'ESR', 'DefaultCharges' => 200],
            ['Code' => '1203', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Malaria Test (MP)', 'DefaultCharges' => 400],
            ['Code' => '1204', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'HB', 'DefaultCharges' => 250],
            ['Code' => '1205', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'TLC', 'DefaultCharges' => 250],
            ['Code' => '1206', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'DLC', 'DefaultCharges' => 250],
            ['Code' => '1207', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Platelet Count', 'DefaultCharges' => 250],
            ['Code' => '1208', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Retics', 'DefaultCharges' => 800],
            ['Code' => '1209', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Peripheral Film', 'DefaultCharges' => 500],
            ['Code' => '1210', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Coombs Direct', 'DefaultCharges' => 500],
            ['Code' => '1211', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Coombs Indirect', 'DefaultCharges' => 800],
            ['Code' => '1212', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'BSF', 'DefaultCharges' => 200],
            ['Code' => '1213', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'BSR', 'DefaultCharges' => 200],
            ['Code' => '1214', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Blood Urea', 'DefaultCharges' => 350],
            ['Code' => '1215', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Creatinine', 'DefaultCharges' => 350],
            ['Code' => '1216', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Uric Acid', 'DefaultCharges' => 350],
            ['Code' => '1217', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Bilirubin Total', 'DefaultCharges' => 300],
            ['Code' => '1218', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Bilirubin Direct', 'DefaultCharges' => 300],
            ['Code' => '1219', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Bilirubin Indirect', 'DefaultCharges' => 300],
            ['Code' => '1220', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'ALT / SGPT', 'DefaultCharges' => 350],
            ['Code' => '1221', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'AST / SGOT', 'DefaultCharges' => 350],
            ['Code' => '1222', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Alkaline Phosphatase', 'DefaultCharges' => 350],
            ['Code' => '1223', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Total Protein', 'DefaultCharges' => 300],
            ['Code' => '1224', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Albumin', 'DefaultCharges' => 300],
            ['Code' => '1225', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Globulin', 'DefaultCharges' => 200],
            ['Code' => '1226', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'A/G Ratio', 'DefaultCharges' => 200],
            ['Code' => '1227', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Cholesterol', 'DefaultCharges' => 300],
            ['Code' => '1228', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Triglyceride', 'DefaultCharges' => 300],
            ['Code' => '1229', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum HDL', 'DefaultCharges' => 300],
            ['Code' => '1230', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum LDL', 'DefaultCharges' => 300],
            ['Code' => '1231', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'RFTs', 'DefaultCharges' => 700],
            ['Code' => '1232', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'LFTs', 'DefaultCharges' => 1200],
            ['Code' => '1233', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Lipid Profile', 'DefaultCharges' => 1200],
            ['Code' => '1234', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Blood Group & Rh Typing', 'DefaultCharges' => 200],
            ['Code' => '1235', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Urine R/E', 'DefaultCharges' => 300],
            ['Code' => '1236', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Stool R/E', 'DefaultCharges' => 700],
            ['Code' => '1237', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Pregnancy Test (Urine)', 'DefaultCharges' => 150],
            ['Code' => '1238', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Widal Test', 'DefaultCharges' => 400],
            ['Code' => '1239', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'HBsAg (Hepatitis B)', 'DefaultCharges' => 300],
            ['Code' => '1240', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Anti-HCV (Hepatitis C)', 'DefaultCharges' => 300],
            ['Code' => '1241', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'HIV Test', 'DefaultCharges' => 400],
            ['Code' => '1242', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'VDRL / Syphilis Test', 'DefaultCharges' => 400],
            ['Code' => '1243', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'CRP', 'DefaultCharges' => 500],
            ['Code' => '1244', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'CRP (High Sensitive)', 'DefaultCharges' => 1000],
            ['Code' => '1245', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Electrolytes (Na, K, Cl)', 'DefaultCharges' => 1500],
            ['Code' => '1246', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Calcium', 'DefaultCharges' => 400],
            ['Code' => '1247', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Phosphorus', 'DefaultCharges' => 400],
            ['Code' => '1248', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Magnesium', 'DefaultCharges' => 400],
            ['Code' => '1249', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'PT (Prothrombin Time) / INR', 'DefaultCharges' => 500],
            ['Code' => '1250', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'APTT', 'DefaultCharges' => 500],
            ['Code' => '1251', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Blood Culture', 'DefaultCharges' => 3000],
            ['Code' => '1252', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Urine Culture', 'DefaultCharges' => 3000],
            ['Code' => '1253', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Sputum for AFB (TB)', 'DefaultCharges' => 500],
            ['Code' => '1254', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Dengue NS1 Antigen', 'DefaultCharges' => 800],
            ['Code' => '1255', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Dengue IgM / IgG Antibodies', 'DefaultCharges' => 1600],
            ['Code' => '1256', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Typhidot IgM / IgG', 'DefaultCharges' => 400],
            ['Code' => '1257', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Covid-19 Rapid Antigen Test', 'DefaultCharges' => 1500],
            ['Code' => '1258', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Semen Analysis', 'DefaultCharges' => 1000],
            ['Code' => '1259', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'RA Factor', 'DefaultCharges' => 400],
            ['Code' => '1260', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'ANA', 'DefaultCharges' => 1000],
            ['Code' => '1261', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'H.Pylori Ab.', 'DefaultCharges' => 500],
            ['Code' => '1262', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'B.Group, Screening, Cross Match', 'DefaultCharges' => 2500],
            ['Code' => '1263', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'B.Group, Cross Match', 'DefaultCharges' => 500],
            ['Code' => '1264', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'CPK', 'DefaultCharges' => 800],
            ['Code' => '1265', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'CK MB', 'DefaultCharges' => 800],
            ['Code' => '1266', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Troponin T', 'DefaultCharges' => 1500],
            ['Code' => '1267', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Troponin I', 'DefaultCharges' => 1500],
            ['Code' => '1268', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Pleural Fluid', 'DefaultCharges' => 1000],
            ['Code' => '1269', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Ascitic Fluid', 'DefaultCharges' => 1000],
            ['Code' => '1270', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Synovial Fluid', 'DefaultCharges' => 1000],
            ['Code' => '1271', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'CSF Analysis', 'DefaultCharges' => 1000],
            ['Code' => '1272', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'HBA1C', 'DefaultCharges' => 1600],
            ['Code' => '1273', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Beta HCG', 'DefaultCharges' => 2000],
            ['Code' => '1274', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'T3', 'DefaultCharges' => 1500],
            ['Code' => '1275', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Free T3', 'DefaultCharges' => 1500],
            ['Code' => '1276', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'T4', 'DefaultCharges' => 1500],
            ['Code' => '1277', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Free T4', 'DefaultCharges' => 1500],
            ['Code' => '1278', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'TSH', 'DefaultCharges' => 1500],
            ['Code' => '1279', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'LH', 'DefaultCharges' => 1800],
            ['Code' => '1280', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'FSH', 'DefaultCharges' => 1800],
            ['Code' => '1281', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Prolactin', 'DefaultCharges' => 1800],
            ['Code' => '1282', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'ASO Titer', 'DefaultCharges' => 500],
            ['Code' => '1283', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Amylase', 'DefaultCharges' => 1000],

            // Radiology (X-Ray, Ultrasound, CT Scan, MRI)
            ['Code' => '1401', 'DepartmentName' => 'X-Ray', 'ServiceName' => 'Ultrasound', 'DefaultCharges' => 1000],
            ['Code' => '1402', 'DepartmentName' => 'CT Scan', 'ServiceName' => 'CT Scan', 'DefaultCharges' => 5000],
            ['Code' => '1403', 'DepartmentName' => 'MRI', 'ServiceName' => 'MRI', 'DefaultCharges' => 10000],
            ['Code' => '1404', 'DepartmentName' => 'X-Ray', 'ServiceName' => 'Mammography', 'DefaultCharges' => 5000],
            ['Code' => '1405', 'DepartmentName' => 'X-Ray', 'ServiceName' => 'X-ray', 'DefaultCharges' => 700],
        ];

        foreach ($services as $item) {
            $deptName = $item['DepartmentName'];
            if (!isset($departments[$deptName])) {
                continue;
            }

            Service::firstOrCreate(
                ['ServiceName' => $item['ServiceName']],
                [
                    'Code' => $item['Code'],
                    'DepartmentId' => $departments[$deptName],
                    'ServiceName' => $item['ServiceName'],
                    'DefaultCharges' => $item['DefaultCharges'],
                    'printToken' => $item['printToken'] ?? false,
                ]
            );
        }
    }
}
