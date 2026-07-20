<?php

namespace App\Http\Controllers;

use App\Models\InsuranceCompany;
use Illuminate\Http\Request;

class InsuranceCompanyController extends Controller
{
    public function index(Request $request)
    {
        $query = InsuranceCompany::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('contactPerson', 'like', "%{$search}%");
            });
        }

        if ($request->has('isActive') && $request->isActive !== null) {
            $query->where('isActive', $request->boolean('isActive'));
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:insurance_companies,name',
            'phone' => 'nullable|string|max:20',
            'contactPerson' => 'nullable|string|max:100',
            'mobile' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:50',
            'address' => 'nullable|string|max:255',
            'isCredit' => 'boolean',
            'validityHours' => 'integer|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'isActive' => 'boolean',
        ]);

        $validated['CreatedAt'] = now();
        $company = InsuranceCompany::create($validated);

        return response()->json($company, 201);
    }

    public function show(InsuranceCompany $insuranceCompany)
    {
        return response()->json($insuranceCompany);
    }

    public function update(Request $request, InsuranceCompany $insuranceCompany)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:insurance_companies,name,' . $insuranceCompany->id,
            'phone' => 'nullable|string|max:20',
            'contactPerson' => 'nullable|string|max:100',
            'mobile' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:50',
            'address' => 'nullable|string|max:255',
            'isCredit' => 'boolean',
            'validityHours' => 'integer|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'isActive' => 'boolean',
        ]);

        $validated['UpdatedAt'] = now();
        $insuranceCompany->update($validated);

        return response()->json($insuranceCompany);
    }

    public function destroy(InsuranceCompany $insuranceCompany)
    {
        $insuranceCompany->delete();
        return response()->json(['message' => 'Insurance company deleted successfully']);
    }
}
