<?php

namespace App\Http\Controllers;

use App\Models\PharmacyMedicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PharmacyMedicineController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('pharmacy_medicines')
            ->leftJoin('pharmacy_generics', 'pharmacy_medicines.generic_id', '=', 'pharmacy_generics.id')
            ->leftJoin('pharmacy_categories', 'pharmacy_medicines.category_id', '=', 'pharmacy_categories.id')
            ->leftJoin('pharmacy_dosage_forms', 'pharmacy_medicines.dosage_form_id', '=', 'pharmacy_dosage_forms.id')
            ->leftJoin('pharmacy_manufacturers', 'pharmacy_medicines.manufacturer_id', '=', 'pharmacy_manufacturers.id')
            ->leftJoin('pharmacy_units as p_units', 'pharmacy_medicines.purchase_unit_id', '=', 'p_units.id')
            ->leftJoin('pharmacy_units as s_units', 'pharmacy_medicines.sale_unit_id', '=', 's_units.id')
            ->select(
                'pharmacy_medicines.*',
                'pharmacy_generics.generic_name as generic_name',
                'pharmacy_generics.therapeutic_class as therapeutic_class',
                'pharmacy_categories.name as category_name',
                'pharmacy_dosage_forms.name as dosage_form_name',
                'pharmacy_manufacturers.name as manufacturer_name',
                'p_units.name as purchase_unit_name',
                's_units.name as sale_unit_name'
            );

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('pharmacy_medicines.brand_name', 'like', "%{$search}%")
                  ->orWhere('pharmacy_medicines.item_code', 'like', "%{$search}%")
                  ->orWhere('pharmacy_medicines.barcode', 'like', "%{$search}%")
                  ->orWhere('pharmacy_generics.generic_name', 'like', "%{$search}%")
                  ->orWhere('pharmacy_manufacturers.name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('pharmacy_medicines.category_id', $request->category_id);
        }

        if ($request->filled('dosage_form_id')) {
            $query->where('pharmacy_medicines.dosage_form_id', $request->dosage_form_id);
        }

        if ($request->filled('manufacturer_id')) {
            $query->where('pharmacy_medicines.manufacturer_id', $request->manufacturer_id);
        }

        if ($request->filled('generic_id')) {
            $query->where('pharmacy_medicines.generic_id', $request->generic_id);
        }

        if ($request->has('requires_prescription') && $request->requires_prescription !== null && $request->requires_prescription !== '') {
            $query->where('pharmacy_medicines.requires_prescription', filter_var($request->requires_prescription, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('is_narcotic') && $request->is_narcotic !== null && $request->is_narcotic !== '') {
            $query->where('pharmacy_medicines.is_narcotic', filter_var($request->is_narcotic, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '') {
            $query->where('pharmacy_medicines.is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $medicines = $query->orderBy('pharmacy_medicines.brand_name', 'asc')->get();

        return response()->json($medicines);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_code' => 'nullable|string|max:50|unique:pharmacy_medicines,item_code',
            'barcode' => 'nullable|string|max:100',
            'brand_name' => 'required|string|max:200',
            'generic_id' => 'nullable|string|exists:pharmacy_generics,id',
            'category_id' => 'nullable|string|exists:pharmacy_categories,id',
            'dosage_form_id' => 'nullable|string|exists:pharmacy_dosage_forms,id',
            'manufacturer_id' => 'nullable|string|exists:pharmacy_manufacturers,id',
            'purchase_unit_id' => 'nullable|string|exists:pharmacy_units,id',
            'sale_unit_id' => 'nullable|string|exists:pharmacy_units,id',
            'unit_conversion' => 'nullable|integer|min:1',
            'purchase_price' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'mrp' => 'nullable|numeric|min:0',
            'tax_percent' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0',
            'min_reorder_level' => 'nullable|integer|min:0',
            'max_stock_level' => 'nullable|integer|min:0',
            'rack_location' => 'nullable|string|max:50',
            'requires_prescription' => 'nullable|boolean',
            'is_narcotic' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $id = (string) Str::uuid();
        $itemCode = !empty($validated['item_code']) ? $validated['item_code'] : PharmacyMedicine::generateItemCode();
        $barcode = !empty(trim($validated['barcode'] ?? '')) ? trim($validated['barcode']) : PharmacyMedicine::generateBarcode($itemCode);

        $data = [
            'id' => $id,
            'item_code' => $itemCode,
            'barcode' => $barcode,
            'brand_name' => $validated['brand_name'],
            'generic_id' => $validated['generic_id'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'dosage_form_id' => $validated['dosage_form_id'] ?? null,
            'manufacturer_id' => $validated['manufacturer_id'] ?? null,
            'purchase_unit_id' => $validated['purchase_unit_id'] ?? null,
            'sale_unit_id' => $validated['sale_unit_id'] ?? null,
            'unit_conversion' => $validated['unit_conversion'] ?? 1,
            'purchase_price' => $validated['purchase_price'] ?? 0.00,
            'sale_price' => $validated['sale_price'] ?? 0.00,
            'mrp' => $validated['mrp'] ?? ($validated['sale_price'] ?? 0.00),
            'tax_percent' => $validated['tax_percent'] ?? 0.00,
            'discount_percent' => $validated['discount_percent'] ?? 0.00,
            'min_reorder_level' => $validated['min_reorder_level'] ?? 10,
            'max_stock_level' => $validated['max_stock_level'] ?? null,
            'rack_location' => $validated['rack_location'] ?? null,
            'requires_prescription' => $validated['requires_prescription'] ?? false,
            'is_narcotic' => $validated['is_narcotic'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        DB::table('pharmacy_medicines')->insert($data);

        return $this->show($id);
    }

    public function show($id)
    {
        $medicine = DB::table('pharmacy_medicines')
            ->leftJoin('pharmacy_generics', 'pharmacy_medicines.generic_id', '=', 'pharmacy_generics.id')
            ->leftJoin('pharmacy_categories', 'pharmacy_medicines.category_id', '=', 'pharmacy_categories.id')
            ->leftJoin('pharmacy_dosage_forms', 'pharmacy_medicines.dosage_form_id', '=', 'pharmacy_dosage_forms.id')
            ->leftJoin('pharmacy_manufacturers', 'pharmacy_medicines.manufacturer_id', '=', 'pharmacy_manufacturers.id')
            ->leftJoin('pharmacy_units as p_units', 'pharmacy_medicines.purchase_unit_id', '=', 'p_units.id')
            ->leftJoin('pharmacy_units as s_units', 'pharmacy_medicines.sale_unit_id', '=', 's_units.id')
            ->where('pharmacy_medicines.id', $id)
            ->select(
                'pharmacy_medicines.*',
                'pharmacy_generics.generic_name as generic_name',
                'pharmacy_generics.therapeutic_class as therapeutic_class',
                'pharmacy_categories.name as category_name',
                'pharmacy_dosage_forms.name as dosage_form_name',
                'pharmacy_manufacturers.name as manufacturer_name',
                'p_units.name as purchase_unit_name',
                's_units.name as sale_unit_name'
            )
            ->first();

        if (!$medicine) {
            return response()->json(['message' => 'Medicine item not found'], 404);
        }

        return response()->json($medicine);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'item_code' => "nullable|string|max:50|unique:pharmacy_medicines,item_code,{$id}",
            'barcode' => 'nullable|string|max:100',
            'brand_name' => 'required|string|max:200',
            'generic_id' => 'nullable|string|exists:pharmacy_generics,id',
            'category_id' => 'nullable|string|exists:pharmacy_categories,id',
            'dosage_form_id' => 'nullable|string|exists:pharmacy_dosage_forms,id',
            'manufacturer_id' => 'nullable|string|exists:pharmacy_manufacturers,id',
            'purchase_unit_id' => 'nullable|string|exists:pharmacy_units,id',
            'sale_unit_id' => 'nullable|string|exists:pharmacy_units,id',
            'unit_conversion' => 'nullable|integer|min:1',
            'purchase_price' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'mrp' => 'nullable|numeric|min:0',
            'tax_percent' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0',
            'min_reorder_level' => 'nullable|integer|min:0',
            'max_stock_level' => 'nullable|integer|min:0',
            'rack_location' => 'nullable|string|max:50',
            'requires_prescription' => 'nullable|boolean',
            'is_narcotic' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $exists = DB::table('pharmacy_medicines')->where('id', $id)->exists();
        if (!$exists) {
            return response()->json(['message' => 'Medicine item not found'], 404);
        }

        $data = [
            'barcode' => $validated['barcode'] ?? null,
            'brand_name' => $validated['brand_name'],
            'generic_id' => $validated['generic_id'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'dosage_form_id' => $validated['dosage_form_id'] ?? null,
            'manufacturer_id' => $validated['manufacturer_id'] ?? null,
            'purchase_unit_id' => $validated['purchase_unit_id'] ?? null,
            'sale_unit_id' => $validated['sale_unit_id'] ?? null,
            'unit_conversion' => $validated['unit_conversion'] ?? 1,
            'purchase_price' => $validated['purchase_price'] ?? 0.00,
            'sale_price' => $validated['sale_price'] ?? 0.00,
            'mrp' => $validated['mrp'] ?? ($validated['sale_price'] ?? 0.00),
            'tax_percent' => $validated['tax_percent'] ?? 0.00,
            'discount_percent' => $validated['discount_percent'] ?? 0.00,
            'min_reorder_level' => $validated['min_reorder_level'] ?? 10,
            'max_stock_level' => $validated['max_stock_level'] ?? null,
            'rack_location' => $validated['rack_location'] ?? null,
            'requires_prescription' => $validated['requires_prescription'] ?? false,
            'is_narcotic' => $validated['is_narcotic'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'updated_at' => now(),
        ];

        if (!empty($validated['item_code'])) {
            $data['item_code'] = $validated['item_code'];
        }

        DB::table('pharmacy_medicines')->where('id', $id)->update($data);

        return $this->show($id);
    }

    public function destroy($id)
    {
        $medicine = DB::table('pharmacy_medicines')->where('id', $id)->first();

        if (!$medicine) {
            return response()->json(['message' => 'Medicine item not found'], 404);
        }

        DB::table('pharmacy_medicines')->where('id', $id)->delete();

        return response()->json(['message' => 'Medicine deleted successfully']);
    }

    public function searchBarcode($barcode)
    {
        $medicine = DB::table('pharmacy_medicines')
            ->leftJoin('pharmacy_generics', 'pharmacy_medicines.generic_id', '=', 'pharmacy_generics.id')
            ->leftJoin('pharmacy_categories', 'pharmacy_medicines.category_id', '=', 'pharmacy_categories.id')
            ->leftJoin('pharmacy_dosage_forms', 'pharmacy_medicines.dosage_form_id', '=', 'pharmacy_dosage_forms.id')
            ->leftJoin('pharmacy_manufacturers', 'pharmacy_medicines.manufacturer_id', '=', 'pharmacy_manufacturers.id')
            ->leftJoin('pharmacy_units as s_units', 'pharmacy_medicines.sale_unit_id', '=', 's_units.id')
            ->where('pharmacy_medicines.barcode', $barcode)
            ->orWhere('pharmacy_medicines.item_code', $barcode)
            ->select(
                'pharmacy_medicines.*',
                'pharmacy_generics.generic_name as generic_name',
                'pharmacy_categories.name as category_name',
                'pharmacy_dosage_forms.name as dosage_form_name',
                'pharmacy_manufacturers.name as manufacturer_name',
                's_units.name as sale_unit_name'
            )
            ->first();

        if (!$medicine) {
            return response()->json(['message' => 'No medicine matched this barcode or code'], 404);
        }

        return response()->json($medicine);
    }

    public function getNextBarcode()
    {
        $barcode = PharmacyMedicine::generateBarcode();
        return response()->json(['barcode' => $barcode]);
    }
}
