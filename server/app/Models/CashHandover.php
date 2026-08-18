<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CashHandover extends Model
{
    protected $table = 'cash_handovers';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'handoverNo',
        'userId',
        'shiftType',
        'shiftStartDate',
        'shiftEndDate',
        'openingBalance',
        'systemExpectedCash',
        'physicalCashCounted',
        'cardCollected',
        'onlineCollected',
        'totalGrossCollected',
        'totalRefunded',
        'varianceAmount',
        'varianceType',
        'denominations',
        'status',
        'acceptedBy',
        'acceptedAt',
        'notes',
        'isSynced',
    ];

    protected $casts = [
        'shiftStartDate' => 'datetime',
        'shiftEndDate' => 'datetime',
        'openingBalance' => 'decimal:2',
        'systemExpectedCash' => 'decimal:2',
        'physicalCashCounted' => 'decimal:2',
        'cardCollected' => 'decimal:2',
        'onlineCollected' => 'decimal:2',
        'totalGrossCollected' => 'decimal:2',
        'totalRefunded' => 'decimal:2',
        'varianceAmount' => 'decimal:2',
        'denominations' => 'array',
        'acceptedAt' => 'datetime',
        'isSynced' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (CashHandover $model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
            if (empty($model->handoverNo)) {
                $model->handoverNo = self::generateHandoverNo();
            }
        });
    }

    public static function generateHandoverNo(): string
    {
        $prefix = 'CHO-' . now()->format('my') . '-';
        $maxSeq = \Illuminate\Support\Facades\DB::table('cash_handovers')
            ->where('handoverNo', 'like', "{$prefix}%")
            ->get()
            ->map(function ($row) use ($prefix) {
                return intval(substr($row->handoverNo, strlen($prefix)));
            })
            ->max();

        $nextSeq = $maxSeq ? $maxSeq + 1 : 1;
        return $prefix . $nextSeq;
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'acceptedBy');
    }
}
