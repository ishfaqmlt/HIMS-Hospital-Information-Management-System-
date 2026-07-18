<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RadiologyScan;
use App\Models\Department;
use Illuminate\Support\Facades\DB;

class RadiologyScanSeeder extends Seeder
{
    public function run(): void
    {
        $radiologyDept = Department::where('DepartmentName', 'Radiology')->first();

        $scans = [
            ['ScanCode' => 'RAD-001', 'ScanName' => 'X-Ray Chest', 'Category' => 'X-Ray', 'Price' => 500, 'DurationMinutes' => 15, 'PreparationNotes' => 'No preparation required'],
            ['ScanCode' => 'RAD-002', 'ScanName' => 'X-Ray Abdomen', 'Category' => 'X-Ray', 'Price' => 600, 'DurationMinutes' => 15, 'PreparationNotes' => 'Empty stomach preferred'],
            ['ScanCode' => 'RAD-003', 'ScanName' => 'CT Scan Head', 'Category' => 'CT', 'Price' => 3000, 'DurationMinutes' => 30, 'PreparationNotes' => 'No preparation required'],
            ['ScanCode' => 'RAD-004', 'ScanName' => 'CT Scan Abdomen', 'Category' => 'CT', 'Price' => 4000, 'DurationMinutes' => 45, 'PreparationNotes' => 'Fasting for 4 hours'],
            ['ScanCode' => 'RAD-005', 'ScanName' => 'CT Scan Spine', 'Category' => 'CT', 'Price' => 3500, 'DurationMinutes' => 40, 'PreparationNotes' => 'No preparation required'],
            ['ScanCode' => 'RAD-006', 'ScanName' => 'MRI Brain', 'Category' => 'MRI', 'Price' => 5000, 'DurationMinutes' => 60, 'PreparationNotes' => 'Remove all metal objects'],
            ['ScanCode' => 'RAD-007', 'ScanName' => 'MRI Spine', 'Category' => 'MRI', 'Price' => 5500, 'DurationMinutes' => 60, 'PreparationNotes' => 'Remove all metal objects'],
            ['ScanCode' => 'RAD-008', 'ScanName' => 'MRI Knee', 'Category' => 'MRI', 'Price' => 4500, 'DurationMinutes' => 45, 'PreparationNotes' => 'Remove all metal objects'],
            ['ScanCode' => 'RAD-009', 'ScanName' => 'Ultrasound Abdomen', 'Category' => 'Ultrasound', 'Price' => 800, 'DurationMinutes' => 20, 'PreparationNotes' => 'Full bladder preferred'],
            ['ScanCode' => 'RAD-010', 'ScanName' => 'Ultrasound Pelvis', 'Category' => 'Ultrasound', 'Price' => 800, 'DurationMinutes' => 20, 'PreparationNotes' => 'Full bladder required'],
            ['ScanCode' => 'RAD-011', 'ScanName' => 'Mammography', 'Category' => 'X-Ray', 'Price' => 1500, 'DurationMinutes' => 20, 'PreparationNotes' => 'No deodorant on day of exam'],
            ['ScanCode' => 'RAD-012', 'ScanName' => 'DEXA Scan', 'Category' => 'X-Ray', 'Price' => 2000, 'DurationMinutes' => 30, 'PreparationNotes' => 'No preparation required'],
        ];

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        RadiologyScan::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        foreach ($scans as $scan) {
            RadiologyScan::create(array_merge($scan, [
                'DepartmentId' => $radiologyDept?->id,
                'isActive' => true,
                'CreatedBy' => 1,
            ]));
        }

        $this->command->info('Radiology Scan seeder completed successfully.');
    }
}
