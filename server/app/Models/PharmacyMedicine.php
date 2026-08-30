<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PharmacyMedicine extends Model
{
    use HasFactory;

    protected $table = 'pharmacy_medicines';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'item_code',
        'barcode',
        'brand_name',
        'generic_id',
        'category_id',
        'dosage_form_id',
        'manufacturer_id',
        'purchase_unit_id',
        'sale_unit_id',
        'unit_conversion',
        'purchase_price',
        'sale_price',
        'mrp',
        'tax_percent',
        'discount_percent',
        'min_reorder_level',
        'max_stock_level',
        'rack_location',
        'requires_prescription',
        'is_narcotic',
        'is_active',
    ];

    protected $casts = [
        'unit_conversion' => 'integer',
        'purchase_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'mrp' => 'decimal:2',
        'tax_percent' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'min_reorder_level' => 'integer',
        'max_stock_level' => 'integer',
        'requires_prescription' => 'boolean',
        'is_narcotic' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (PharmacyMedicine $model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
            if (empty($model->item_code)) {
                $model->item_code = self::generateItemCode();
            }
            if (empty($model->barcode)) {
                $model->barcode = self::generateBarcode($model->item_code);
            }
        });
    }

    public static function generateItemCode(): string
    {
        $prefix = 'MED-' . date('y') . '-';

        return DB::transaction(function () use ($prefix) {
            $sequence = DB::table('system_sequences')
                ->where('prefix', $prefix)
                ->lockForUpdate()
                ->first();

            if (!$sequence) {
                $maxSeq = DB::table('pharmacy_medicines')
                    ->where('item_code', 'like', "{$prefix}%")
                    ->get()
                    ->map(function ($row) use ($prefix) {
                        return intval(substr($row->item_code, strlen($prefix)));
                    })
                    ->max();

                $startVal = $maxSeq ? $maxSeq + 1 : 1;

                DB::table('system_sequences')->insert([
                    'prefix' => $prefix,
                    'current_value' => $startVal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $nextVal = $startVal;
            } else {
                $nextVal = $sequence->current_value + 1;
                DB::table('system_sequences')
                    ->where('prefix', $prefix)
                    ->update([
                        'current_value' => $nextVal,
                        'updated_at' => now(),
                    ]);
            }

            return $prefix . $nextVal;
        });
    }

    public static function generateBarcode(?string $itemCode = null): string
    {
        // 12-digit standard numeric barcode format: 896 (PK Country prefix) + YY (Year) + 7-digit sequence
        // e.g. 896260001001
        $prefix = 'BC-' . date('y') . '-';

        return DB::transaction(function () use ($prefix, $itemCode) {
            $seqNumber = null;
            if ($itemCode && preg_match('/-(\d+)$/', $itemCode, $matches)) {
                $seqNumber = intval($matches[1]);
            }

            if ($seqNumber !== null) {
                return '896' . date('y') . str_pad((string) $seqNumber, 7, '0', STR_PAD_LEFT);
            }

            $sequence = DB::table('system_sequences')
                ->where('prefix', $prefix)
                ->lockForUpdate()
                ->first();

            if (!$sequence) {
                $maxSeq = DB::table('pharmacy_medicines')
                    ->where('barcode', 'like', '896' . date('y') . '%')
                    ->get()
                    ->map(function ($row) {
                        return intval(substr($row->barcode, 5));
                    })
                    ->max();

                $startVal = $maxSeq ? $maxSeq + 1 : 1;

                DB::table('system_sequences')->insert([
                    'prefix' => $prefix,
                    'current_value' => $startVal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $nextVal = $startVal;
            } else {
                $nextVal = $sequence->current_value + 1;
                DB::table('system_sequences')
                    ->where('prefix', $prefix)
                    ->update([
                        'current_value' => $nextVal,
                        'updated_at' => now(),
                    ]);
            }

            return '896' . date('y') . str_pad((string) $nextVal, 7, '0', STR_PAD_LEFT);
        });
    }

    public function generic()
    {
        return $this->belongsTo(PharmacyGeneric::class, 'generic_id');
    }

    public function category()
    {
        return $this->belongsTo(PharmacyCategory::class, 'category_id');
    }

    public function dosageForm()
    {
        return $this->belongsTo(PharmacyDosageForm::class, 'dosage_form_id');
    }

    public function manufacturer()
    {
        return $this->belongsTo(PharmacyManufacturer::class, 'manufacturer_id');
    }

    public function purchaseUnit()
    {
        return $this->belongsTo(PharmacyUnit::class, 'purchase_unit_id');
    }

    public function saleUnit()
    {
        return $this->belongsTo(PharmacyUnit::class, 'sale_unit_id');
    }
}
