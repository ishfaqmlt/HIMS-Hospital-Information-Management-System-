<?php

namespace Database\Seeders;

use App\Models\InsurancePlan;
use App\Models\InsuranceCompany;
use Illuminate\Database\Seeder;

class InsurancePlanSeeder extends Seeder
{
    public function run(): void
    {
        $companies = InsuranceCompany::all();

        if ($companies->isEmpty()) {
            return;
        }

        $plans = [
            ['planName' => 'Basic Plan', 'coverageDetails' => 'Covers basic hospitalization and OPD', 'CoveragePercent' => 50.00, 'AnnualLimit' => 100000.00],
            ['planName' => 'Standard Plan', 'coverageDetails' => 'Covers hospitalization, OPD, and lab tests', 'CoveragePercent' => 70.00, 'AnnualLimit' => 300000.00],
            ['planName' => 'Premium Plan', 'coverageDetails' => 'Full coverage including surgery and ICU', 'CoveragePercent' => 90.00, 'AnnualLimit' => 500000.00],
            ['planName' => 'Gold Plan', 'coverageDetails' => 'Comprehensive coverage with no sub-limits', 'CoveragePercent' => 100.00, 'AnnualLimit' => 1000000.00],
            ['planName' => 'Family Plan', 'coverageDetails' => 'Coverage for entire family with shared limit', 'CoveragePercent' => 80.00, 'AnnualLimit' => 800000.00],
        ];

        foreach ($companies as $company) {
            foreach ($plans as $plan) {
                InsurancePlan::firstOrCreate(
                    [
                        'InsuranceCompanyId' => $company->id,
                        'planName' => $plan['planName'],
                    ],
                    $plan
                );
            }
        }
    }
}
