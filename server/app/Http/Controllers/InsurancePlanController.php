<?php

namespace App\Http\Controllers;

use App\Models\InsurancePlan;
use Illuminate\Http\Request;

class InsurancePlanController extends Controller
{
    public function index(Request $request)
    {
        $query = InsurancePlan::with('company');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('planName', 'like', "%{$search}%")
                  ->orWhere('coverageDetails', 'like', "%{$search}%");
            });
        }

        if ($request->has('InsuranceCompanyId') && $request->InsuranceCompanyId) {
            $query->where('InsuranceCompanyId', $request->InsuranceCompanyId);
        }

        if ($request->has('isActive') && $request->isActive !== null) {
            $query->where('isActive', $request->boolean('isActive'));
        }

        return response()->json($query->orderBy('planName')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'InsuranceCompanyId' => 'required|exists:insurance_companies,id',
            'planName' => 'required|string|max:255',
            'coverageDetails' => 'nullable|string',
            'CoveragePercent' => 'required|numeric|min:0|max:100',
            'AnnualLimit' => 'nullable|numeric|min:0',
            'isActive' => 'boolean',
        ]);

        $plan = InsurancePlan::create($validated);

        return response()->json($plan->load('company'), 201);
    }

    public function show(InsurancePlan $insurancePlan)
    {
        return response()->json($insurancePlan->load('company'));
    }

    public function update(Request $request, InsurancePlan $insurancePlan)
    {
        $validated = $request->validate([
            'InsuranceCompanyId' => 'required|exists:insurance_companies,id',
            'planName' => 'required|string|max:255',
            'coverageDetails' => 'nullable|string',
            'CoveragePercent' => 'required|numeric|min:0|max:100',
            'AnnualLimit' => 'nullable|numeric|min:0',
            'isActive' => 'boolean',
        ]);

        $insurancePlan->update($validated);

        return response()->json($insurancePlan->load('company'));
    }

    public function destroy(InsurancePlan $insurancePlan)
    {
        $insurancePlan->delete();
        return response()->json(['message' => 'Insurance plan deleted successfully']);
    }
}
