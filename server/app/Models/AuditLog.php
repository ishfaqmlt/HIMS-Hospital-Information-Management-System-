<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AuditLog extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'userId',
        'action',
        'module',
        'recordId',
        'details',
        'ipAddress',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (AuditLog $log) {
            if (empty($log->id)) {
                $log->id = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }

    public static function logAction($action, $module, $recordId = null, array $details = [], $userId = null)
    {
        try {
            return self::create([
                'userId' => $userId ?? auth()->id(),
                'action' => $action,
                'module' => $module,
                'recordId' => (string) $recordId,
                'details' => $details,
                'ipAddress' => request()->ip(),
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to write audit log: ' . $e->getMessage());
            return null;
        }
    }
}
