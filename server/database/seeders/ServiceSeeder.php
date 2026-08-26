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
            // OPD (Consultations)
            ['Code' => '401', 'DepartmentName' => 'OPD', 'ServiceName' => 'Consultation Fee', 'service_type' => 'consultation', 'DefaultCharges' => 500, 'printToken' => true],
            ['Code' => '402', 'DepartmentName' => 'OPD', 'ServiceName' => 'Follow Up', 'service_type' => 'consultation', 'DefaultCharges' => 300, 'printToken' => true],

            // ECG / Cardiology
            ['Code' => '501', 'DepartmentName' => 'ECG', 'ServiceName' => 'ECG', 'service_type' => 'investigation', 'DefaultCharges' => 300],
            ['Code' => '502', 'DepartmentName' => 'ECG', 'ServiceName' => 'ECHO', 'service_type' => 'investigation', 'DefaultCharges' => 1500],
            ['Code' => '503', 'DepartmentName' => 'ECG', 'ServiceName' => 'Angiography', 'service_type' => 'procedure', 'DefaultCharges' => 50000],
            ['Code' => '504', 'DepartmentName' => 'ECG', 'ServiceName' => 'Angioplasty', 'service_type' => 'procedure', 'DefaultCharges' => 50000],

            // Indoor (General Charges & Surgical Procedures)
            ['Code' => '601', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Bed Charges', 'service_type' => 'general_charge', 'DefaultCharges' => 5000],
            ['Code' => '602', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Admission Fee', 'service_type' => 'general_charge', 'DefaultCharges' => 200],
            ['Code' => '603', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Appendix', 'service_type' => 'procedure', 'DefaultCharges' => 35000],
            ['Code' => '604', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Left Inguinal Hernia', 'service_type' => 'procedure', 'DefaultCharges' => 35000],
            ['Code' => '605', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Right Inguinal Hernia', 'service_type' => 'procedure', 'DefaultCharges' => 35000],
            ['Code' => '606', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Cholecystectomy', 'service_type' => 'procedure', 'DefaultCharges' => 35000],
            ['Code' => '607', 'DepartmentName' => 'Indoor', 'ServiceName' => 'Cesarean Section', 'service_type' => 'procedure', 'DefaultCharges' => 50000],

            // Laboratory (Diagnostic Investigations)
            ['Code' => '1201', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'CBC', 'service_type' => 'investigation', 'DefaultCharges' => 800],
            ['Code' => '1202', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'ESR', 'service_type' => 'investigation', 'DefaultCharges' => 200],
            ['Code' => '1203', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Malaria Test (MP)', 'service_type' => 'investigation', 'DefaultCharges' => 400],
            ['Code' => '1204', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'HB', 'service_type' => 'investigation', 'DefaultCharges' => 250],
            ['Code' => '1205', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'TLC', 'service_type' => 'investigation', 'DefaultCharges' => 250],
            ['Code' => '1206', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'DLC', 'service_type' => 'investigation', 'DefaultCharges' => 250],
            ['Code' => '1207', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Platelet Count', 'service_type' => 'investigation', 'DefaultCharges' => 250],
            ['Code' => '1208', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Retics', 'service_type' => 'investigation', 'DefaultCharges' => 800],
            ['Code' => '1209', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Peripheral Film', 'service_type' => 'investigation', 'DefaultCharges' => 500],
            ['Code' => '1210', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Coombs Direct', 'service_type' => 'investigation', 'DefaultCharges' => 500],
            ['Code' => '1211', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Coombs Indirect', 'service_type' => 'investigation', 'DefaultCharges' => 800],
            ['Code' => '1212', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'BSF', 'service_type' => 'investigation', 'DefaultCharges' => 200],
            ['Code' => '1213', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'BSR', 'service_type' => 'investigation', 'DefaultCharges' => 200],
            ['Code' => '1214', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Blood Urea', 'service_type' => 'investigation', 'DefaultCharges' => 350],
            ['Code' => '1215', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Creatinine', 'service_type' => 'investigation', 'DefaultCharges' => 350],
            ['Code' => '1216', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Uric Acid', 'service_type' => 'investigation', 'DefaultCharges' => 350],
            ['Code' => '1217', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Bilirubin Total', 'service_type' => 'investigation', 'DefaultCharges' => 300],
            ['Code' => '1218', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Bilirubin Direct', 'service_type' => 'investigation', 'DefaultCharges' => 300],
            ['Code' => '1219', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Bilirubin Indirect', 'service_type' => 'investigation', 'DefaultCharges' => 300],
            ['Code' => '1220', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'ALT / SGPT', 'service_type' => 'investigation', 'DefaultCharges' => 350],
            ['Code' => '1221', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'AST / SGOT', 'service_type' => 'investigation', 'DefaultCharges' => 350],
            ['Code' => '1222', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Alkaline Phosphatase', 'service_type' => 'investigation', 'DefaultCharges' => 350],
            ['Code' => '1223', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Total Protein', 'service_type' => 'investigation', 'DefaultCharges' => 300],
            ['Code' => '1224', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Albumin', 'service_type' => 'investigation', 'DefaultCharges' => 300],
            ['Code' => '1225', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Globulin', 'service_type' => 'investigation', 'DefaultCharges' => 200],
            ['Code' => '1226', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'A/G Ratio', 'service_type' => 'investigation', 'DefaultCharges' => 200],
            ['Code' => '1227', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Cholesterol', 'service_type' => 'investigation', 'DefaultCharges' => 300],
            ['Code' => '1228', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Triglyceride', 'service_type' => 'investigation', 'DefaultCharges' => 300],
            ['Code' => '1229', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum HDL', 'service_type' => 'investigation', 'DefaultCharges' => 300],
            ['Code' => '1230', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum LDL', 'service_type' => 'investigation', 'DefaultCharges' => 300],
            ['Code' => '1231', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'RFTs', 'service_type' => 'investigation', 'DefaultCharges' => 700],
            ['Code' => '1232', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'LFTs', 'service_type' => 'investigation', 'DefaultCharges' => 1200],
            ['Code' => '1233', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Lipid Profile', 'service_type' => 'investigation', 'DefaultCharges' => 1200],
            ['Code' => '1234', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Blood Group & Rh Typing', 'service_type' => 'investigation', 'DefaultCharges' => 200],
            ['Code' => '1235', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Urine R/E', 'service_type' => 'investigation', 'DefaultCharges' => 300],
            ['Code' => '1236', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Stool R/E', 'service_type' => 'investigation', 'DefaultCharges' => 700],
            ['Code' => '1237', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Pregnancy Test (Urine)', 'service_type' => 'investigation', 'DefaultCharges' => 150],
            ['Code' => '1238', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Widal Test', 'service_type' => 'investigation', 'DefaultCharges' => 400],
            ['Code' => '1239', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'HBsAg (Hepatitis B)', 'service_type' => 'investigation', 'DefaultCharges' => 300],
            ['Code' => '1240', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Anti-HCV (Hepatitis C)', 'service_type' => 'investigation', 'DefaultCharges' => 300],
            ['Code' => '1241', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'HIV Test', 'service_type' => 'investigation', 'DefaultCharges' => 400],
            ['Code' => '1242', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'VDRL / Syphilis Test', 'service_type' => 'investigation', 'DefaultCharges' => 400],
            ['Code' => '1243', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'CRP', 'service_type' => 'investigation', 'DefaultCharges' => 500],
            ['Code' => '1244', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'CRP (High Sensitive)', 'service_type' => 'investigation', 'DefaultCharges' => 1000],
            ['Code' => '1245', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Electrolytes (Na, K, Cl)', 'service_type' => 'investigation', 'DefaultCharges' => 1500],
            ['Code' => '1246', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Calcium', 'service_type' => 'investigation', 'DefaultCharges' => 400],
            ['Code' => '1247', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Phosphorus', 'service_type' => 'investigation', 'DefaultCharges' => 400],
            ['Code' => '1248', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Magnesium', 'service_type' => 'investigation', 'DefaultCharges' => 400],
            ['Code' => '1249', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'PT (Prothrombin Time) / INR', 'service_type' => 'investigation', 'DefaultCharges' => 500],
            ['Code' => '1250', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'APTT', 'service_type' => 'investigation', 'DefaultCharges' => 500],
            ['Code' => '1251', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Blood Culture', 'service_type' => 'investigation', 'DefaultCharges' => 3000],
            ['Code' => '1252', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Urine Culture', 'service_type' => 'investigation', 'DefaultCharges' => 3000],
            ['Code' => '1253', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Sputum for AFB (TB)', 'service_type' => 'investigation', 'DefaultCharges' => 500],
            ['Code' => '1254', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Dengue NS1 Antigen', 'service_type' => 'investigation', 'DefaultCharges' => 800],
            ['Code' => '1255', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Dengue IgM / IgG Antibodies', 'service_type' => 'investigation', 'DefaultCharges' => 1600],
            ['Code' => '1256', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Typhidot IgM / IgG', 'service_type' => 'investigation', 'DefaultCharges' => 400],
            ['Code' => '1257', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Covid-19 Rapid Antigen Test', 'service_type' => 'investigation', 'DefaultCharges' => 1500],
            ['Code' => '1258', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Semen Analysis', 'service_type' => 'investigation', 'DefaultCharges' => 1000],
            ['Code' => '1259', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'RA Factor', 'service_type' => 'investigation', 'DefaultCharges' => 400],
            ['Code' => '1260', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'ANA', 'service_type' => 'investigation', 'DefaultCharges' => 1000],
            ['Code' => '1261', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'H.Pylori Ab.', 'service_type' => 'investigation', 'DefaultCharges' => 500],
            ['Code' => '1262', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'B.Group, Screening, Cross Match', 'service_type' => 'investigation', 'DefaultCharges' => 2500],
            ['Code' => '1263', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'B.Group, Cross Match', 'service_type' => 'investigation', 'DefaultCharges' => 500],
            ['Code' => '1264', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'CPK', 'service_type' => 'investigation', 'DefaultCharges' => 800],
            ['Code' => '1265', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'CK MB', 'service_type' => 'investigation', 'DefaultCharges' => 800],
            ['Code' => '1266', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Troponin T', 'service_type' => 'investigation', 'DefaultCharges' => 1500],
            ['Code' => '1267', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Troponin I', 'service_type' => 'investigation', 'DefaultCharges' => 1500],
            ['Code' => '1268', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Pleural Fluid', 'service_type' => 'investigation', 'DefaultCharges' => 1000],
            ['Code' => '1269', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Ascitic Fluid', 'service_type' => 'investigation', 'DefaultCharges' => 1000],
            ['Code' => '1270', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Synovial Fluid', 'service_type' => 'investigation', 'DefaultCharges' => 1000],
            ['Code' => '1271', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'CSF Analysis', 'service_type' => 'investigation', 'DefaultCharges' => 1000],
            ['Code' => '1272', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'HBA1C', 'service_type' => 'investigation', 'DefaultCharges' => 1600],
            ['Code' => '1273', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Beta HCG', 'service_type' => 'investigation', 'DefaultCharges' => 2000],
            ['Code' => '1274', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'T3', 'service_type' => 'investigation', 'DefaultCharges' => 1500],
            ['Code' => '1275', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Free T3', 'service_type' => 'investigation', 'DefaultCharges' => 1500],
            ['Code' => '1276', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'T4', 'service_type' => 'investigation', 'DefaultCharges' => 1500],
            ['Code' => '1277', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Free T4', 'service_type' => 'investigation', 'DefaultCharges' => 1500],
            ['Code' => '1278', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'TSH', 'service_type' => 'investigation', 'DefaultCharges' => 1500],
            ['Code' => '1279', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'LH', 'service_type' => 'investigation', 'DefaultCharges' => 1800],
            ['Code' => '1280', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'FSH', 'service_type' => 'investigation', 'DefaultCharges' => 1800],
            ['Code' => '1281', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Prolactin', 'service_type' => 'investigation', 'DefaultCharges' => 1800],
            ['Code' => '1282', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'ASO Titer', 'service_type' => 'investigation', 'DefaultCharges' => 500],
            ['Code' => '1283', 'DepartmentName' => 'Laboratory', 'ServiceName' => 'Serum Amylase', 'service_type' => 'investigation', 'DefaultCharges' => 1000],

            // Radiology / Imaging (Diagnostic Investigations)
            ['Code' => '1401', 'DepartmentName' => 'X-Ray', 'ServiceName' => 'Ultrasound', 'service_type' => 'investigation', 'DefaultCharges' => 1000],
            ['Code' => '1402', 'DepartmentName' => 'CT Scan', 'ServiceName' => 'CT Scan', 'service_type' => 'investigation', 'DefaultCharges' => 5000],
            ['Code' => '1403', 'DepartmentName' => 'MRI', 'ServiceName' => 'MRI', 'service_type' => 'investigation', 'DefaultCharges' => 10000],
            ['Code' => '1404', 'DepartmentName' => 'X-Ray', 'ServiceName' => 'Mammography', 'service_type' => 'investigation', 'DefaultCharges' => 5000],
            ['Code' => '1405', 'DepartmentName' => 'X-Ray', 'ServiceName' => 'X-ray', 'service_type' => 'investigation', 'DefaultCharges' => 700],
        ];

        foreach ($services as $item) {
            $deptName = $item['DepartmentName'];
            if (!isset($departments[$deptName])) {
                continue;
            }

            Service::updateOrCreate(
                ['ServiceName' => $item['ServiceName']],
                [
                    'Code' => $item['Code'],
                    'DepartmentId' => $departments[$deptName],
                    'service_type' => $item['service_type'] ?? 'general_charge',
                    'DefaultCharges' => $item['DefaultCharges'],
                    'printToken' => $item['printToken'] ?? false,
                    'isActive' => true,
                ]
            );
        }
    }
}
