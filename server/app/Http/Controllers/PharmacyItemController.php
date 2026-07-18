<?php

namespace App\Http\Controllers;

use App\Models\PharmacyItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PharmacyItemController extends Controller
{
    public function index(Request $request)
    {
        $query = PharmacyItem::query();

        if ($request->has('category') && $request->category && $request->category !== 'All') {
            $query->where('Category', $request->category);
        }

        if ($request->has('isActive') && $request->isActive !== null) {
            $query->where('isActive', $request->isActive);
        }

        if ($request->has('lowStock') && $request->lowStock) {
            $query->whereColumn('StockQuantity', '<=', 'ReorderLevel');
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ItemCode', 'like', "%{$search}%")
                  ->orWhere('ItemName', 'like', "%{$search}%")
                  ->orWhere('Manufacturer', 'like', "%{$search}%")
                  ->orWhere('BatchNo', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ItemCode' => 'required|string|max:20',
            'ItemName' => 'required|string|max:100',
            'Category' => 'nullable|string|max:50',
            'Manufacturer' => 'nullable|string|max:100',
            'Unit' => 'required|string|max:20',
            'PurchasePrice' => 'required|numeric|min:0',
            'SellingPrice' => 'required|numeric|min:0',
            'StockQuantity' => 'required|integer|min:0',
            'ReorderLevel' => 'required|integer|min:0',
            'ExpiryDate' => 'nullable|date',
            'BatchNo' => 'nullable|string|max:50',
            'isActive' => 'boolean',
            'isSynced' => 'boolean',
        ]);

        $validated['CreatedBy'] = Auth::id();

        $item = PharmacyItem::create($validated);

        return response()->json($item, 201);
    }

    public function show(PharmacyItem $pharmacyItem)
    {
        return response()->json($pharmacyItem);
    }

    public function update(Request $request, PharmacyItem $pharmacyItem)
    {
        $validated = $request->validate([
            'ItemCode' => 'required|string|max:20',
            'ItemName' => 'required|string|max:100',
            'Category' => 'nullable|string|max:50',
            'Manufacturer' => 'nullable|string|max:100',
            'Unit' => 'required|string|max:20',
            'PurchasePrice' => 'required|numeric|min:0',
            'SellingPrice' => 'required|numeric|min:0',
            'StockQuantity' => 'required|integer|min:0',
            'ReorderLevel' => 'required|integer|min:0',
            'ExpiryDate' => 'nullable|date',
            'BatchNo' => 'nullable|string|max:50',
            'isActive' => 'boolean',
            'isSynced' => 'boolean',
        ]);

        $pharmacyItem->update($validated);

        return response()->json($pharmacyItem);
    }

    public function destroy(PharmacyItem $pharmacyItem)
    {
        $pharmacyItem->delete();

        return response()->json(['message' => 'Pharmacy item deleted']);
    }
}
