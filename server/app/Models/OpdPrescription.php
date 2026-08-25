<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class OpdPrescription extends Model
{
    use HasFactory;

    protected $table = 'opd_prescriptions';
    
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'prescriptionNo',
        'visitId',
        'patientId',
        'doctorId',
        'presc_date',
        'advice',
        'followUpDate',
        'status',
    ];

    protected $casts = [
        'presc_date' => 'datetime',
        'followUpDate' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (OpdPrescription $prescription) {
            if (empty($prescription->id)) {
                $prescription->id = (string) Str::uuid();
            }
            if (empty($prescription->prescriptionNo)) {
                $prescription->prescriptionNo = self::generatePrescriptionNo();
            }
        });
    }

    /**
     * Auto-generate Prescription No: RX-MMYY-SEQ (e.g. RX-0826-1)
     */
    public static function generatePrescriptionNo(): string
    {
        $prefix = 'RX-' . date('my') . '-';

        return DB::transaction(function () use ($prefix) {
            $sequence = DB::table('system_sequences')
                ->where('prefix', $prefix)
                ->lockForUpdate()
                ->first();

            if (!$sequence) {
                $maxSeq = DB::table('opd_prescriptions')
                    ->where('prescriptionNo', 'like', "{$prefix}%")
                    ->get()
                    ->map(function ($row) use ($prefix) {
                        return intval(substr($row->prescriptionNo, strlen($prefix)));
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
}
