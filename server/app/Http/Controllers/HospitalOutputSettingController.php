<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class HospitalOutputSettingController extends Controller
{
    public function show()
    {
        $setting = DB::table('hospital_output_settings')->first();

        if (!$setting) {
            $id = Str::uuid();
            DB::table('hospital_output_settings')->insert([
                'id' => $id,
                'headerFooterByDefault' => true,
                'showHeader' => true,
                'headerImage' => null,
                'showQrCode' => true,
                'headerHeightMargin' => 0,
                'showFooterImage' => false,
                'footerImage' => null,
                'showLegalDisclaimer' => true,
                'legalDisclaimerText' => 'Thank you for choosing our services',
                'footerHeightMargin' => 0,
                'textFont' => 'Inter',
                'textSize' => 12,
                'reportFormat' => 'A4',
                'isSynced' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $setting = DB::table('hospital_output_settings')->where('id', $id)->first();
        }

        return response()->json($setting);
    }

    public function update(Request $request)
    {
        $setting = DB::table('hospital_output_settings')->first();

        $validated = $request->validate([
            'headerFooterByDefault' => 'nullable|boolean',
            'showHeader' => 'nullable|boolean',
            'headerImage' => 'nullable|string',
            'showQrCode' => 'nullable|boolean',
            'headerHeightMargin' => 'nullable|numeric',
            'showFooterImage' => 'nullable|boolean',
            'footerImage' => 'nullable|string',
            'showLegalDisclaimer' => 'nullable|boolean',
            'legalDisclaimerText' => 'nullable|string|max:255',
            'footerHeightMargin' => 'nullable|numeric',
            'textFont' => 'nullable|string|max:100',
            'textSize' => 'nullable|numeric',
            'reportFormat' => 'nullable|string|max:50',
        ]);

        $validated['updated_at'] = now();

        if ($setting) {
            DB::table('hospital_output_settings')->where('id', $setting->id)->update($validated);
            $updated = DB::table('hospital_output_settings')->where('id', $setting->id)->first();
        } else {
            $validated['id'] = Str::uuid();
            $validated['created_at'] = now();
            DB::table('hospital_output_settings')->insert($validated);
            $updated = DB::table('hospital_output_settings')->where('id', $validated['id'])->first();
        }

        return response()->json($updated);
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'type' => 'required|in:header,footer',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $request->type . '.' . $file->getClientOriginalExtension();
            
            $destinationPath = public_path('uploads/hospital');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0777, true);
            }

            $file->move($destinationPath, $filename);
            $url = '/uploads/hospital/' . $filename;

            $setting = DB::table('hospital_output_settings')->first();
            $field = $request->type === 'header' ? 'headerImage' : 'footerImage';
            
            if ($setting) {
                DB::table('hospital_output_settings')->where('id', $setting->id)->update([
                    $field => $url,
                    'updated_at' => now(),
                ]);
            } else {
                $newId = Str::uuid();
                DB::table('hospital_output_settings')->insert([
                    'id' => $newId,
                    $field => $url,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return response()->json([
                'message' => 'Image uploaded successfully',
                'url' => $url,
                'field' => $field,
            ]);
        }

        return response()->json(['message' => 'No image uploaded'], 400);
    }
}
