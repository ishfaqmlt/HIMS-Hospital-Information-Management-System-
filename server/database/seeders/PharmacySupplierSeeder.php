<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PharmacySupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'Metro Pharma Distributors',
                'contact_person' => 'Muhammad Kashif',
                'phone' => '042-35889901',
                'mobile' => '0300-1234567',
                'email' => 'orders@metropharma.pk',
                'address' => 'Plot 45, Industrial Estate, Multan Road',
                'city' => 'Lahore',
                'ntn_number' => '4123890-1',
                'strn_number' => '03-01-4123-890-19',
                'drug_license_no' => 'DL-LHR-2024-88',
                'opening_balance' => 0.00,
                'current_balance' => 0.00,
                'is_active' => true,
            ],
            [
                'name' => 'Allied Drug Agency & Logistics',
                'contact_person' => 'Syed Rizwan Shah',
                'phone' => '051-4433221',
                'mobile' => '0321-7654321',
                'email' => 'sales@allieddrugs.com',
                'address' => 'Main IJP Road, Sector I-9',
                'city' => 'Islamabad',
                'ntn_number' => '3987654-2',
                'strn_number' => '07-02-3987-654-22',
                'drug_license_no' => 'DL-ISB-2023-104',
                'opening_balance' => 0.00,
                'current_balance' => 0.00,
                'is_active' => true,
            ],
            [
                'name' => 'Medix Healthcare Wholesale',
                'contact_person' => 'Tariq Mehmood',
                'phone' => '061-6512345',
                'mobile' => '0333-9876543',
                'email' => 'supply@medixhealthcare.com',
                'address' => 'Nishtar Road, Near Medicine Market',
                'city' => 'Multan',
                'ntn_number' => '5678123-4',
                'strn_number' => '05-09-5678-123-41',
                'drug_license_no' => 'DL-MLT-2022-49',
                'opening_balance' => 0.00,
                'current_balance' => 0.00,
                'is_active' => true,
            ],
            [
                'name' => 'Premier Medical Suppliers',
                'contact_person' => 'Zubair Ahmed',
                'phone' => '021-34567890',
                'mobile' => '0345-1122334',
                'email' => 'zubair@premiermed.pk',
                'address' => 'Shahrah-e-Faisal, Block 6 PECHS',
                'city' => 'Karachi',
                'ntn_number' => '2190876-5',
                'strn_number' => '01-04-2190-876-55',
                'drug_license_no' => 'DL-KHI-2025-12',
                'opening_balance' => 0.00,
                'current_balance' => 0.00,
                'is_active' => true,
            ],
            [
                'name' => 'Bhakkar Regional Pharma Agencies',
                'contact_person' => 'Malik Asad',
                'phone' => '0453-512890',
                'mobile' => '0302-8877665',
                'email' => 'bhakkarpharma@gmail.com',
                'address' => 'Opposite DHQ Hospital, Club Road',
                'city' => 'Bhakkar',
                'ntn_number' => '6712345-9',
                'strn_number' => '09-11-6712-345-90',
                'drug_license_no' => 'DL-BKR-2024-05',
                'opening_balance' => 0.00,
                'current_balance' => 0.00,
                'is_active' => true,
            ],
        ];

        foreach ($suppliers as $supplier) {
            $exists = DB::table('pharmacy_suppliers')->where('name', $supplier['name'])->exists();
            if (!$exists) {
                DB::table('pharmacy_suppliers')->insert(array_merge($supplier, [
                    'id' => (string) Str::uuid(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }
        }
    }
}
