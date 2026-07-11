<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions for each module
        $modules = [
            'registration', 'opd', 'emergency', 'ipd', 'icu', 'ot',
            'nursing', 'doctors', 'appointments', 'billing', 'pharmacy',
            'laboratory', 'radiology', 'blood_bank', 'vaccination', 'dialysis',
            'physiotherapy', 'dental', 'cardiology', 'endoscopy', 'oncology',
            'mortuary', 'ambulance', 'house_keeping', 'kitchen_diet', 'laundry',
            'inventory', 'purchase', 'store', 'fixed_assets', 'accounts',
            'payroll', 'human_resources', 'attendance', 'leave_management',
            'insurance', 'packages', 'referrals', 'medical_records', 'reports',
            'dashboard', 'settings', 'administration',
        ];

        foreach ($modules as $module) {
            Permission::create(['name' => "view_{$module}"]);
            Permission::create(['name' => "create_{$module}"]);
            Permission::create(['name' => "edit_{$module}"]);
            Permission::create(['name' => "delete_{$module}"]);
        }

        // Create roles and assign permissions
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo(Permission::all()->filter(fn ($p) => !str_contains($p->name, 'delete_')));

        $doctor = Role::create(['name' => 'doctor']);
        $doctor->givePermissionTo([
            'view_dashboard', 'view_opd', 'view_ipd', 'view_icu',
            'view_nursing', 'view_appointments', 'view_laboratory',
            'view_radiology', 'view_pharmacy', 'view_medical_records',
            'create_medical_records', 'edit_medical_records',
        ]);

        $nurse = Role::create(['name' => 'nurse']);
        $nurse->givePermissionTo([
            'view_dashboard', 'view_nursing', 'view_ipd', 'view_icu',
            'view_appointments', 'view_laboratory', 'view_pharmacy',
            'create_nursing', 'edit_nursing',
        ]);

        $receptionist = Role::create(['name' => 'receptionist']);
        $receptionist->givePermissionTo([
            'view_dashboard', 'view_registration', 'view_opd',
            'view_appointments', 'view_billing', 'view_insurance',
            'create_registration', 'edit_registration',
            'create_appointments', 'edit_appointments',
        ]);

        $pharmacist = Role::create(['name' => 'pharmacist']);
        $pharmacist->givePermissionTo([
            'view_dashboard', 'view_pharmacy', 'view_inventory',
            'create_pharmacy', 'edit_pharmacy',
            'view_store', 'create_store', 'edit_store',
        ]);

        $labTechnician = Role::create(['name' => 'lab_technician']);
        $labTechnician->givePermissionTo([
            'view_dashboard', 'view_laboratory', 'view_radiology',
            'create_laboratory', 'edit_laboratory',
        ]);

        $accountant = Role::create(['name' => 'accountant']);
        $accountant->givePermissionTo([
            'view_dashboard', 'view_accounts', 'view_billing',
            'view_payroll', 'view_purchase',
            'create_accounts', 'edit_accounts',
        ]);

        // Create default admin user
        $adminUser = \App\Models\User::create([
            'name' => 'Admin',
            'email' => 'admin@hims.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);
        $adminUser->assignRole('super_admin');
    }
}
