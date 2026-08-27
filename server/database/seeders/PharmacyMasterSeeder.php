<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PharmacyMasterSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Units
        $units = [
            'Tablet', 'Capsule', 'Bottle', 'Box', 'Strip', 'Vial', 'Ampoule',
            'Sachet', 'Tube', 'Pfs', 'Can', 'Pack', 'Piece', 'Drop', 'ml', 'mg', 'gm'
        ];

        foreach ($units as $unit) {
            $exists = DB::table('pharmacy_units')->whereRaw('LOWER(name) = ?', [strtolower($unit)])->first();
            if (!$exists) {
                DB::table('pharmacy_units')->insert([
                    'id' => (string) Str::uuid(),
                    'name' => $unit,
                    'is_active' => true,
                ]);
            }
        }

        // 2. Dosage Forms
        $forms = [
            'Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Infusion',
            'Oral Drops', 'Eye Drops', 'Ear Drops', 'Nasal Spray', 'Inhaler',
            'Ointment', 'Cream', 'Gel', 'Lotion', 'Suppository', 'Powder', 'Sachet'
        ];

        foreach ($forms as $form) {
            $exists = DB::table('pharmacy_dosage_forms')->whereRaw('LOWER(name) = ?', [strtolower($form)])->first();
            if (!$exists) {
                DB::table('pharmacy_dosage_forms')->insert([
                    'id' => (string) Str::uuid(),
                    'name' => $form,
                    'is_active' => true,
                ]);
            }
        }

        // 3. Categories
        $categories = [
            ['name' => 'Antibiotics & Anti-infectives', 'code' => 'CAT-ANTI', 'description' => 'Antibacterial and antimicrobial medications'],
            ['name' => 'Analgesics & Antipyretics', 'code' => 'CAT-ANAL', 'description' => 'Pain relievers and fever reducers'],
            ['name' => 'Anti-inflammatory & NSAIDs', 'code' => 'CAT-NSAI', 'description' => 'Non-steroidal anti-inflammatory agents'],
            ['name' => 'Cardiovascular & Antihypertensive', 'code' => 'CAT-CARD', 'description' => 'Blood pressure and heart medications'],
            ['name' => 'Gastrointestinal & Anti-ulcer', 'code' => 'CAT-GAST', 'description' => 'Antacids, PPIs, anti-emetics, laxatives'],
            ['name' => 'Endocrine & Antidiabetic', 'code' => 'CAT-DIAB', 'description' => 'Oral hypoglycemics, insulin, thyroid agents'],
            ['name' => 'Respiratory & Antiasthmatic', 'code' => 'CAT-RESP', 'description' => 'Bronchodilators, cough syrups, antihistamines'],
            ['name' => 'Central Nervous System (CNS)', 'code' => 'CAT-CNS', 'description' => 'Sedatives, anxiolytics, anticonvulsants, antidepressants'],
            ['name' => 'Dermatologicals', 'code' => 'CAT-DERM', 'description' => 'Topical creams, ointments, antifungal lotions'],
            ['name' => 'Vitamins, Minerals & Supplements', 'code' => 'CAT-SUPP', 'description' => 'Multivitamins, calcium, iron, nutritional supplements'],
            ['name' => 'Ophthalmological & ENT', 'code' => 'CAT-OPHT', 'description' => 'Eye, ear, and nasal solutions'],
            ['name' => 'IV Fluids & Electrolytes', 'code' => 'CAT-IVFL', 'description' => 'Normal Saline, Dextrose Water, Ringer Lactate'],
        ];

        foreach ($categories as $cat) {
            $exists = DB::table('pharmacy_categories')->whereRaw('LOWER(name) = ?', [strtolower($cat['name'])])->first();
            if (!$exists) {
                DB::table('pharmacy_categories')->insert([
                    'id' => (string) Str::uuid(),
                    'name' => $cat['name'],
                    'code' => $cat['code'],
                    'description' => $cat['description'],
                    'is_active' => true,
                ]);
            }
        }

        // 4. Generics
        $generics = [
            ['generic_name' => 'Paracetamol', 'therapeutic_class' => 'Analgesic & Antipyretic'],
            ['generic_name' => 'Ibuprofen', 'therapeutic_class' => 'NSAID'],
            ['generic_name' => 'Diclofenac Sodium', 'therapeutic_class' => 'NSAID'],
            ['generic_name' => 'Amoxicillin', 'therapeutic_class' => 'Penicillin Antibiotic'],
            ['generic_name' => 'Amoxicillin + Clavulanic Acid', 'therapeutic_class' => 'Penicillin + Beta-Lactamase Inhibitor'],
            ['generic_name' => 'Ciprofloxacin', 'therapeutic_class' => 'Fluoroquinolone Antibiotic'],
            ['generic_name' => 'Levofloxacin', 'therapeutic_class' => 'Fluoroquinolone Antibiotic'],
            ['generic_name' => 'Azithromycin', 'therapeutic_class' => 'Macrolide Antibiotic'],
            ['generic_name' => 'Ceftriaxone', 'therapeutic_class' => '3rd Gen Cephalosporin'],
            ['generic_name' => 'Cefixime', 'therapeutic_class' => '3rd Gen Cephalosporin'],
            ['generic_name' => 'Omeprazole', 'therapeutic_class' => 'Proton Pump Inhibitor (PPI)'],
            ['generic_name' => 'Esomeprazole', 'therapeutic_class' => 'Proton Pump Inhibitor (PPI)'],
            ['generic_name' => 'Metformin HCl', 'therapeutic_class' => 'Biguanide Antidiabetic'],
            ['generic_name' => 'Glimepiride', 'therapeutic_class' => 'Sulfonylurea Antidiabetic'],
            ['generic_name' => 'Amlodipine Besylate', 'therapeutic_class' => 'Calcium Channel Blocker'],
            ['generic_name' => 'Losartan Potassium', 'therapeutic_class' => 'Angiotensin II Receptor Blocker (ARB)'],
            ['generic_name' => 'Atorvastatin', 'therapeutic_class' => 'HMG-CoA Reductase Inhibitor (Statin)'],
            ['generic_name' => 'Salbutamol', 'therapeutic_class' => 'Beta-2 Agonist Bronchodilator'],
            ['generic_name' => 'Montelukast Sodium', 'therapeutic_class' => 'Leukotriene Receptor Antagonist'],
            ['generic_name' => 'Cetirizine HCl', 'therapeutic_class' => 'Antihistamine (2nd Gen)'],
            ['generic_name' => 'Metronidazole', 'therapeutic_class' => 'Nitroimidazole Antiprotozoal / Antibacterial'],
        ];

        foreach ($generics as $gen) {
            $exists = DB::table('pharmacy_generics')->whereRaw('LOWER(generic_name) = ?', [strtolower($gen['generic_name'])])->first();
            if (!$exists) {
                DB::table('pharmacy_generics')->insert([
                    'id' => (string) Str::uuid(),
                    'generic_name' => $gen['generic_name'],
                    'therapeutic_class' => $gen['therapeutic_class'],
                    'is_active' => true,
                ]);
            }
        }

        // 5. Manufacturers
        $manufacturers = [
            ['name' => 'GlaxoSmithKline (GSK) Pakistan', 'contact_number' => '+92-21-111-475-111', 'email' => 'info@gsk.com.pk', 'country' => 'Pakistan'],
            ['name' => 'Abbott Laboratories Pakistan', 'contact_number' => '+92-21-111-222-688', 'email' => 'pk.info@abbott.com', 'country' => 'Pakistan'],
            ['name' => 'Getz Pharma (Pvt) Ltd', 'contact_number' => '+92-21-38645000', 'email' => 'info@getzpharma.com', 'country' => 'Pakistan'],
            ['name' => 'The Searle Company Limited', 'contact_number' => '+92-21-35874281', 'email' => 'info@searlecompany.com', 'country' => 'Pakistan'],
            ['name' => 'Hilton Pharma (Pvt) Ltd', 'contact_number' => '+92-21-35061611', 'email' => 'info@hiltonpharma.com', 'country' => 'Pakistan'],
            ['name' => 'Sanofi-Aventis Pakistan Ltd', 'contact_number' => '+92-21-111-726-634', 'email' => 'contact@sanofi.com.pk', 'country' => 'Pakistan'],
            ['name' => 'Pfizer Pakistan Limited', 'contact_number' => '+92-21-111-734-937', 'email' => 'pfizer.pakistan@pfizer.com', 'country' => 'Pakistan'],
            ['name' => 'Ferozsons Laboratories Limited', 'contact_number' => '+92-42-36026700', 'email' => 'info@ferozsons-labs.com', 'country' => 'Pakistan'],
            ['name' => 'Sami Pharmaceuticals (Pvt) Ltd', 'contact_number' => '+92-21-35070001', 'email' => 'info@samipharmapk.com', 'country' => 'Pakistan'],
            ['name' => 'Novartis Pharma Pakistan Ltd', 'contact_number' => '+92-21-35610050', 'email' => 'info.pakistan@novartis.com', 'country' => 'Pakistan'],
            ['name' => 'Highnoon Laboratories Ltd', 'contact_number' => '+92-42-37510034', 'email' => 'info@highnoon.com.pk', 'country' => 'Pakistan'],
            ['name' => 'Martin Dow Limited', 'contact_number' => '+92-21-111-111-635', 'email' => 'info@martindow.com', 'country' => 'Pakistan'],
            ['name' => 'Bosch Pharmaceuticals', 'contact_number' => '+92-21-35060661', 'email' => 'info@boschpharma.com', 'country' => 'Pakistan'],
            ['name' => 'CCL Pharmaceuticals', 'contact_number' => '+92-42-35805555', 'email' => 'info@cclpharma.com', 'country' => 'Pakistan'],
        ];

        foreach ($manufacturers as $mfg) {
            $exists = DB::table('pharmacy_manufacturers')->whereRaw('LOWER(name) = ?', [strtolower($mfg['name'])])->first();
            if (!$exists) {
                DB::table('pharmacy_manufacturers')->insert([
                    'id' => (string) Str::uuid(),
                    'name' => $mfg['name'],
                    'contact_number' => $mfg['contact_number'],
                    'email' => $mfg['email'],
                    'country' => $mfg['country'],
                    'is_active' => true,
                ]);
            }
        }
    }
}
