<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

Artisan::command('fix:refunds', function () {
    $refunds = DB::table('patient_payments')
        ->where(function($q) {
            $q->where('remarks', 'like', '%Refund%')
              ->orWhere('remarks', 'like', '%Return%');
        })
        ->where('debit', '>', 0)
        ->get();

    foreach ($refunds as $p) {
        DB::table('patient_payments')
            ->where('id', $p->id)
            ->update([
                'credit' => $p->debit,
                'debit' => 0,
                'advanceBalance' => 0,
            ]);
    }
    $this->info("Fixed " . count($refunds) . " refund entries.");
});

Artisan::command('hims:reset-transactions {--force : Bypass confirmation prompt}', function () {
    $force = $this->option('force');

    $this->newLine();
    $this->warn('*************************************************************');
    $this->warn('*          HIMS TRANSACTION & PATIENT ACTIVITY RESET        *');
    $this->warn('*************************************************************');
    $this->info('This command will truncate all patients, visits, billings,');
    $this->info('prescriptions, medications, and lab case results.');
    $this->info('ALL MASTER DATA (users, roles, departments, services,');
    $this->info('clinical masters, pharmacy masters, etc.) WILL BE PRESERVED.');
    $this->newLine();

    if (!$force && !$this->confirm('Are you sure you want to proceed?', false)) {
        $this->warn('Operation cancelled. No database changes were made.');
        return 0;
    }

    $transactionTables = [
        // 1. OPD Clinical records
        'opd_medications',
        'opd_symptoms',
        'opd_physical_exams',
        'opd_diagnoses',
        'opd_investigations',
        'opd_histories',
        'opd_prescriptions',

        // 2. Billings, Payments & Invoices
        'billing_details',
        'billing_payments',
        'payment_details',
        'patient_payments',
        'billings',
        'cash_handovers',

        // 3. Laboratory transactions
        'lab_case_test_results',
        'lab_case_tests',
        'lab_cases',
        'lab_analyzer_data',

        // 4. Patients, Visits & Admissions
        'patient_vitals',
        'patient_appointments',
        'opd_visits',
        'emergency_cases',
        'radiology_scans',
        'ipd_admissions',
        'patient_visits',
        'patients',

        // 5. Sequence numbering counters (resets MRN, INV, LAB, V to start from 1)
        'system_sequences',

        // 6. Logs (optional activity records)
        'audit_logs',
    ];

    $results = [];
    $totalDeleted = 0;

    $this->info('Resetting transactions with foreign key safety...');

    try {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0;');

        foreach ($transactionTables as $table) {
            if (!Schema::hasTable($table)) {
                $results[] = [$table, 'N/A', '<comment>Table does not exist</comment>'];
                continue;
            }

            $count = DB::table($table)->count();
            $totalDeleted += $count;

            DB::table($table)->truncate();

            $results[] = [$table, $count, '<info>Truncated</info>'];
        }
    } catch (\Throwable $e) {
        $this->error('Error during reset: ' . $e->getMessage());
        return 1;
    } finally {
        DB::statement('SET FOREIGN_KEY_CHECKS = 1;');
    }

    $this->newLine();
    $this->table(['Table Name', 'Records Cleared', 'Status'], $results);
    $this->newLine();
    $this->info("Successfully reset {$totalDeleted} transactional records across " . count($transactionTables) . " tables.");
    $this->info("All Master Data & configurations are intact.");
    $this->comment("Next patient created will start fresh from sequence #1.");
    $this->newLine();

    return 0;
})->purpose('Reset all transactional data (patients, visits, billings, prescriptions, lab cases) while preserving master data');

