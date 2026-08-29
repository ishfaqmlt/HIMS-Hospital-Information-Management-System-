<?php

namespace App\Http\Controllers;

use App\Models\PharmacySupplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PharmacySupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('pharmacy_suppliers');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '') {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $suppliers = $query->orderBy('name', 'asc')->get();

        return response()->json($suppliers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'mobile' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:50',
            'ntn_number' => 'nullable|string|max:50',
            'strn_number' => 'nullable|string|max:50',
            'drug_license_no' => 'nullable|string|max:50',
            'opening_balance' => 'nullable|numeric',
            'current_balance' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
        ]);

        $id = (string) Str::uuid();
        $data = [
            'id' => $id,
            'name' => $validated['name'],
            'contact_person' => $validated['contact_person'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'mobile' => $validated['mobile'] ?? null,
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'ntn_number' => $validated['ntn_number'] ?? null,
            'strn_number' => $validated['strn_number'] ?? null,
            'drug_license_no' => $validated['drug_license_no'] ?? null,
            'opening_balance' => $validated['opening_balance'] ?? 0.00,
            'current_balance' => $validated['current_balance'] ?? ($validated['opening_balance'] ?? 0.00),
            'is_active' => $validated['is_active'] ?? true,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        DB::table('pharmacy_suppliers')->insert($data);

        $supplier = DB::table('pharmacy_suppliers')->where('id', $id)->first();

        return response()->json($supplier, 201);
    }

    public function show($id)
    {
        $supplier = DB::table('pharmacy_suppliers')->where('id', $id)->first();

        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }

        return response()->json($supplier);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'mobile' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:50',
            'ntn_number' => 'nullable|string|max:50',
            'strn_number' => 'nullable|string|max:50',
            'drug_license_no' => 'nullable|string|max:50',
            'opening_balance' => 'nullable|numeric',
            'current_balance' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
        ]);

        $exists = DB::table('pharmacy_suppliers')->where('id', $id)->exists();
        if (!$exists) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }

        $data = [
            'name' => $validated['name'],
            'contact_person' => $validated['contact_person'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'mobile' => $validated['mobile'] ?? null,
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'ntn_number' => $validated['ntn_number'] ?? null,
            'strn_number' => $validated['strn_number'] ?? null,
            'drug_license_no' => $validated['drug_license_no'] ?? null,
            'opening_balance' => $validated['opening_balance'] ?? 0.00,
            'current_balance' => $validated['current_balance'] ?? 0.00,
            'is_active' => $validated['is_active'] ?? true,
            'updated_at' => now(),
        ];

        DB::table('pharmacy_suppliers')->where('id', $id)->update($data);

        $supplier = DB::table('pharmacy_suppliers')->where('id', $id)->first();

        return response()->json($supplier);
    }

    public function destroy($id)
    {
        $supplier = DB::table('pharmacy_suppliers')->where('id', $id)->first();

        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }

        DB::table('pharmacy_suppliers')->where('id', $id)->delete();

        return response()->json(['message' => 'Supplier deleted successfully']);
    }
}
