<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Billing;
use App\Models\PatientVisit;
use App\Models\PatientType;
use App\Models\InsuranceCompany;
use App\Models\Department;
use App\Models\Doctor;
use Illuminate\Support\Facades\DB;

class BillingSeeder extends Seeder
{
    public function run(): void
    {
        $visits = PatientVisit::all();
        if ($visits->isEmpty()) {
            return;
        }

        $patientTypes = PatientType::all();
        $insuranceCompanies = InsuranceCompany::all();
        $departments = Department::all();
        $doctors = Doctor::all();

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Billing::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        for ($i = 0; $i < 20; $i++) {
            $visit = $visits->random();
            $subTotal = rand(1000, 50000);
            $discount = rand(0, $subTotal * 0.1);
            $totalAmount = $subTotal - $discount;

            Billing::create([
                'mrn' => $visit->mrn,
                'patientTypeId' => $visit->patientTypeId,
                'InsuranceCompanyId' => $visit->InsuranceCompanyId,
                'DepartmentId' => $visit->DepartmentId,
                'DoctorId' => $visit->DoctorId,
                'InvoiceDate' => now()->subDays(rand(0, 30)),
                'SubTotal' => $subTotal,
                'Discount' => round($discount, 2),
                'TotalAmount' => round($totalAmount, 2),
                'PaymentStatus' => ['Pending', 'Partial', 'Paid', 'Cancelled'][array_rand(['Pending', 'Partial', 'Paid', 'Cancelled'])],
                'BillType' => 'Normal',
                'Notes' => 'Auto-generated billing record',
            ]);
        }

        $this->command->info('Billing seeder completed successfully.');
    }
}
