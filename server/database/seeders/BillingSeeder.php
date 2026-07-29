<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Billing;
use App\Models\PatientVisit;
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

        $departments = Department::all();
        $doctors = Doctor::all();

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Billing::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $billTypes = ['General', 'IPD', 'Return'];
        $statuses = ['Pending', 'Partial', 'Paid', 'Cancelled'];

        for ($i = 0; $i < 20; $i++) {
            $visit = $visits->random();
            $subTotal = rand(1000, 50000);
            $discount = rand(0, intval($subTotal * 0.1));
            $totalAmount = $subTotal - $discount;

            Billing::create([
                'visitId' => $visit->id,
                'InvoiceDate' => now()->subDays(rand(0, 30)),
                'DepartmentId' => $departments->isNotEmpty() ? $departments->random()->id : null,
                'DoctorId' => $doctors->isNotEmpty() ? $doctors->random()->id : null,
                'SubTotal' => $subTotal,
                'Discount' => round($discount, 2),
                'TotalAmount' => round($totalAmount, 2),
                'PaymentStatus' => $statuses[array_rand($statuses)],
                'BillType' => $billTypes[array_rand($billTypes)],
                'Notes' => 'Auto-generated billing record',
                'createdBy' => 1,
            ]);
        }

        $this->command->info('Billing seeder completed successfully.');
    }
}
