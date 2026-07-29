<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\IpdAdmission;
use App\Models\PatientVisit;
use App\Models\Doctor;
use App\Models\FloorMaster;
use App\Models\RoomsWardsMaster;
use App\Models\BedMaster;
use Illuminate\Support\Facades\DB;

class IpdAdmissionSeeder extends Seeder
{
    public function run(): void
    {
        $visits = PatientVisit::all();
        $doctors = Doctor::where('Name', '!=', 'Self')->get();
        $floors = FloorMaster::all();
        $rooms = RoomsWardsMaster::all();
        $beds = BedMaster::all();

        if ($visits->isEmpty() || $doctors->isEmpty() || $floors->isEmpty() || $rooms->isEmpty() || $beds->isEmpty()) {
            return;
        }

        $admissionTypes = ['Elective', 'Emergency', 'Transfer'];
        $statuses = ['Admitted', 'Discharged', 'Transferred', 'Cancelled'];
        $complaints = [
            'Severe abdominal pain',
            'Chest pain with shortness of breath',
            'High fever with dehydration',
            'Post-surgical observation',
            'Cardiac monitoring',
            'Respiratory distress',
        ];
        $diagnoses = [
            'Acute appendicitis',
            'Myocardial infarction',
            'Severe dehydration',
            'Post-operative care',
            'Cardiac arrhythmia',
            'Pneumonia',
        ];

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        IpdAdmission::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        for ($i = 0; $i < 15; $i++) {
            $visit = $visits->random();
            $doctor = $doctors->random();
            $floor = $floors->random();
            $room = $rooms->where('floorId', $floor->id)->random();
            $bed = $beds->where('roomWardId', $room->id)->random();
            $charges = rand(5000, 50000);
            $discount = rand(0, intval($charges * 0.1));
            $payable = $charges - $discount;
            $paid = rand(0, $payable);

            IpdAdmission::create([
                'visitId' => $visit->id,
                'DoctorId' => $doctor->id,
                'FloorId' => $floor->id,
                'RoomWardId' => $room->id,
                'bedId' => $bed->id,
                'AdmissionNo' => 'IPD-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'AdmissionDate' => now()->subDays(rand(0, 30)),
                'DischargeDate' => rand(0, 1) ? now()->subDays(rand(0, 5)) : null,
                'AdmissionType' => $admissionTypes[array_rand($admissionTypes)],
                'Status' => $statuses[array_rand($statuses)],
                'ChiefComplaint' => $complaints[array_rand($complaints)],
                'Diagnosis' => $diagnoses[array_rand($diagnoses)],
                'TreatmentPlan' => 'Medication and monitoring',
                'DischargeSummary' => null,
                'TotalCharges' => $charges,
                'Discount' => round($discount, 2),
                'PayableAmount' => round($payable, 2),
                'TotalPaid' => $paid,
                'Balance' => round($payable - $paid, 2),
                'createdBy' => 1,
            ]);
        }

        $this->command->info('IPD Admission seeder completed successfully.');
    }
}
