<?php

namespace Database\Seeders;

use App\Models\InsuranceCompany;
use Illuminate\Database\Seeder;

class InsuranceCompanySeeder extends Seeder
{
    public function run(): void
    {
        $companies = [
            [
                'name' => 'State Life Insurance',
                'phone' => '021-111-111111',
                'contactPerson' => 'Ahmed Khan',
                'mobile' => '0300-1234567',
                'email' => 'info@statelife.com',
                'address' => 'State Life Building, Karachi',
                'isCredit' => true,
                'validityHours' => 48,
                'discount' => 10.00,
                'isActive' => true,
            ],
            [
                'name' => 'EFU Insurance',
                'phone' => '021-111-222222',
                'contactPerson' => 'Sara Malik',
                'mobile' => '0301-7654321',
                'email' => 'contact@efu.com',
                'address' => 'EFU Building, Lahore',
                'isCredit' => true,
                'validityHours' => 72,
                'discount' => 15.00,
                'isActive' => true,
            ],
            [
                'name' => 'Jubilee Insurance',
                'phone' => '021-111-333333',
                'contactPerson' => 'Usman Ali',
                'mobile' => '0302-9876543',
                'email' => 'info@jubilee.com',
                'address' => 'Jubilee House, Islamabad',
                'isCredit' => false,
                'validityHours' => 24,
                'discount' => 5.00,
                'isActive' => true,
            ],
            [
                'name' => 'Adamjee Insurance',
                'phone' => '021-111-444444',
                'contactPerson' => 'Fatima Noor',
                'mobile' => '0303-5551234',
                'email' => 'support@adamjee.com',
                'address' => 'Adamjee Building, Faisalabad',
                'isCredit' => true,
                'validityHours' => 48,
                'discount' => 12.50,
                'isActive' => true,
            ],
            [
                'name' => 'Askari Insurance',
                'phone' => '021-111-555555',
                'contactPerson' => 'Hassan Raza',
                'mobile' => '0304-3337890',
                'email' => 'info@askari.com',
                'address' => 'Askari Tower, Rawalpindi',
                'isCredit' => false,
                'validityHours' => 24,
                'discount' => 8.00,
                'isActive' => false,
            ],
        ];

        foreach ($companies as $company) {
            InsuranceCompany::firstOrCreate(
                ['name' => $company['name']],
                $company
            );
        }
    }
}
