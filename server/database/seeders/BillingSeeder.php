<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Billing;
use App\Models\Patient;
use Illuminate\Support\Facades\DB;

class BillingSeeder extends Seeder
{
    public function run(): void
    {
        $patients = Patient::all();

        if ($patients->isEmpty()) {
            return;
        }

        $invoiceTypes = ['OPD', 'IPD', 'Emergency', 'Laboratory', 'Pharmacy', 'Radiology', 'Other'];
        $paymentStatuses = ['Pending', 'Partial', 'Paid', 'Cancelled'];
        $paymentMethods = ['Cash', 'Card', 'BankTransfer', 'Insurance', 'Other'];

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Billing::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        for ($i = 0; $i < 20; $i++) {
            $patient = $patients->random();
            $subTotal = rand(1000, 50000);
            $discount = rand(0, $subTotal * 0.1);
            $tax = ($subTotal - $discount) * 0.1;
            $totalAmount = $subTotal - $discount + $tax;
            $paidAmount = rand(0, $totalAmount);

            Billing::create([
                'patientId' => $patient->id,
                'InvoiceNo' => 'INV-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'InvoiceDate' => now()->subDays(rand(0, 30)),
                'InvoiceType' => $invoiceTypes[array_rand($invoiceTypes)],
                'SubTotal' => $subTotal,
                'Discount' => $discount,
                'Tax' => round($tax, 2),
                'TotalAmount' => round($totalAmount, 2),
                'PaidAmount' => round($paidAmount, 2),
                'Balance' => round($totalAmount - $paidAmount, 2),
                'PaymentStatus' => $paidAmount >= $totalAmount ? 'Paid' : ($paidAmount > 0 ? 'Partial' : 'Pending'),
                'PaymentMethod' => $paymentMethods[array_rand($paymentMethods)],
                'Notes' => 'Auto-generated billing record',
                'CreatedBy' => 1,
            ]);
        }

        $this->command->info('Billing seeder completed successfully.');
    }
}
