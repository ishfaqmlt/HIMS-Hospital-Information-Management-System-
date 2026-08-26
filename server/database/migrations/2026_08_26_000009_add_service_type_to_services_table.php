<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->enum('service_type', [
                'investigation',
                'consultation',
                'procedure',
                'general_charge',
                'nursing'
            ])->default('general_charge')->after('ServiceName');
        });

        // Auto-classify existing services based on department
        DB::table('services')
            ->whereIn('DepartmentId', function ($query) {
                $query->select('id')->from('departments')
                    ->whereRaw('LOWER(DepartmentName) LIKE ?', ['%lab%'])
                    ->orWhereRaw('LOWER(DepartmentName) LIKE ?', ['%pathology%'])
                    ->orWhereRaw('LOWER(DepartmentName) LIKE ?', ['%radiology%'])
                    ->orWhereRaw('LOWER(DepartmentName) LIKE ?', ['%x-ray%'])
                    ->orWhereRaw('LOWER(DepartmentName) LIKE ?', ['%ultrasound%']);
            })
            ->update(['service_type' => 'investigation']);

        DB::table('services')
            ->whereRaw('LOWER(ServiceName) LIKE ?', ['%consultation%'])
            ->orWhereRaw('LOWER(ServiceName) LIKE ?', ['%opd fee%'])
            ->update(['service_type' => 'consultation']);
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('service_type');
        });
    }
};
