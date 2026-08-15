<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

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
