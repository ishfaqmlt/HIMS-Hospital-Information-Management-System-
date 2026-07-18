<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PharmacyItem;
use Illuminate\Support\Facades\DB;

class PharmacyItemSeeder extends Seeder
{
    public function run(): void
    {
        $categories = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler'];
        $manufacturers = ['GSK', 'Pfizer', 'Bayer', 'Novartis', 'AstraZeneca', 'Sanofi', 'Merck'];

        $items = [
            ['ItemCode' => 'MED-001', 'ItemName' => 'Paracetamol 500mg', 'Unit' => 'piece', 'PurchasePrice' => 2, 'SellingPrice' => 5, 'StockQuantity' => 1000, 'ReorderLevel' => 100],
            ['ItemCode' => 'MED-002', 'ItemName' => 'Amoxicillin 250mg', 'Unit' => 'piece', 'PurchasePrice' => 5, 'SellingPrice' => 12, 'StockQuantity' => 500, 'ReorderLevel' => 50],
            ['ItemCode' => 'MED-003', 'ItemName' => 'Ibuprofen 400mg', 'Unit' => 'piece', 'PurchasePrice' => 3, 'SellingPrice' => 8, 'StockQuantity' => 800, 'ReorderLevel' => 80],
            ['ItemCode' => 'MED-004', 'ItemName' => 'Cetirizine 10mg', 'Unit' => 'piece', 'PurchasePrice' => 4, 'SellingPrice' => 10, 'StockQuantity' => 600, 'ReorderLevel' => 60],
            ['ItemCode' => 'MED-005', 'ItemName' => 'Omeprazole 20mg', 'Unit' => 'piece', 'PurchasePrice' => 6, 'SellingPrice' => 15, 'StockQuantity' => 400, 'ReorderLevel' => 40],
            ['ItemCode' => 'MED-006', 'ItemName' => 'Metformin 500mg', 'Unit' => 'piece', 'PurchasePrice' => 4, 'SellingPrice' => 10, 'StockQuantity' => 700, 'ReorderLevel' => 70],
            ['ItemCode' => 'MED-007', 'ItemName' => 'Amlodipine 5mg', 'Unit' => 'piece', 'PurchasePrice' => 5, 'SellingPrice' => 12, 'StockQuantity' => 500, 'ReorderLevel' => 50],
            ['ItemCode' => 'MED-008', 'ItemName' => 'Cough Syrup 100ml', 'Unit' => 'bottle', 'PurchasePrice' => 15, 'SellingPrice' => 35, 'StockQuantity' => 200, 'ReorderLevel' => 20],
            ['ItemCode' => 'MED-009', 'ItemName' => 'Insulin Injection', 'Unit' => 'piece', 'PurchasePrice' => 50, 'SellingPrice' => 100, 'StockQuantity' => 100, 'ReorderLevel' => 10],
            ['ItemCode' => 'MED-010', 'ItemName' => 'Eye Drops 10ml', 'Unit' => 'piece', 'PurchasePrice' => 20, 'SellingPrice' => 45, 'StockQuantity' => 300, 'ReorderLevel' => 30],
        ];

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        PharmacyItem::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        foreach ($items as $item) {
            PharmacyItem::create(array_merge($item, [
                'Category' => $categories[array_rand($categories)],
                'Manufacturer' => $manufacturers[array_rand($manufacturers)],
                'ExpiryDate' => now()->addMonths(rand(6, 24)),
                'BatchNo' => 'BATCH-' . rand(1000, 9999),
                'isActive' => true,
                'CreatedBy' => 1,
            ]));
        }

        $this->command->info('Pharmacy Item seeder completed successfully.');
    }
}
