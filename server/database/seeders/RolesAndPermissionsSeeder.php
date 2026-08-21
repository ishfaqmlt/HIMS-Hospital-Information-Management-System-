<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Wipe existing roles and permissions cleanly
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('role_has_permissions')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('model_has_permissions')->truncate();
        DB::table('roles')->truncate();
        DB::table('permissions')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $guard = 'sanctum';

        // Create permissions for each module for sanctum guard
        $modules = [
            'registration', 'opd', 'emergency', 'ipd', 'icu', 'ot',
            'nursing', 'doctors', 'appointments', 'billing', 'pharmacy',
            'laboratory', 'radiology', 'blood_bank', 'vaccination', 'dialysis',
            'physiotherapy', 'dental', 'cardiology', 'endoscopy', 'oncology',
            'mortuary', 'ambulance', 'house_keeping', 'kitchen_diet', 'laundry',
            'inventory', 'purchase', 'store', 'fixed_assets', 'accounts',
            'payroll', 'human_resources', 'attendance', 'leave_management',
            'insurance', 'packages', 'referrals', 'medical_records', 'reports',
            'dashboard', 'settings', 'administration', 'front_desk',
        ];

        $labSubPermissions = [
            'view_lab_dashboard',
            'view_lab_case_registration',
            'view_lab_accept_sample',
            'view_lab_test_perform',
            'view_lab_test_approval',
            'view_lab_patient_reports',
            'view_lab_reports',
            'view_lab_master_settings',
        ];

        $frontDeskSubPermissions = [
            'view_fd_dashboard',
            'view_fd_patient_registration',
            'view_fd_patient_appointments',
            'view_fd_patient_visits',
            'view_fd_billing',
            'view_fd_patient_payments',
            'view_fd_patient_reports',
            'view_fd_collection_reports',
            'view_fd_doctors_collection',
            'view_fd_department_collection',
        ];

        foreach ($modules as $module) {
            Permission::firstOrCreate(['name' => "view_{$module}", 'guard_name' => $guard]);
            Permission::firstOrCreate(['name' => "create_{$module}", 'guard_name' => $guard]);
            Permission::firstOrCreate(['name' => "edit_{$module}", 'guard_name' => $guard]);
            Permission::firstOrCreate(['name' => "delete_{$module}", 'guard_name' => $guard]);
        }

        foreach ($labSubPermissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => $guard]);
        }

        foreach ($frontDeskSubPermissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => $guard]);
        }

        // List of all 14 requested roles
        $rolesConfig = [
            'super_admin' => 'all',
            'admin' => 'no_delete',
            'doctor' => [
                'view_dashboard', 'view_opd', 'view_ipd', 'view_icu',
                'view_nursing', 'view_appointments', 'view_laboratory',
                'view_radiology', 'view_pharmacy', 'view_medical_records',
                'create_medical_records', 'edit_medical_records',
            ],
            'nurse' => [
                'view_dashboard', 'view_nursing', 'view_ipd', 'view_icu',
                'view_appointments', 'view_laboratory', 'view_pharmacy',
                'create_nursing', 'edit_nursing',
            ],
            'receptionist' => array_merge([
                'view_dashboard', 'view_registration', 'view_front_desk', 'view_opd',
                'view_appointments', 'view_billing', 'view_insurance',
                'create_registration', 'edit_registration',
                'create_appointments', 'edit_appointments',
            ], $frontDeskSubPermissions),
            'pharmacist' => [
                'view_dashboard', 'view_pharmacy', 'view_inventory',
                'create_pharmacy', 'edit_pharmacy',
                'view_store', 'create_store', 'edit_store',
            ],
            'lab_phlebotomist' => [
                'view_dashboard', 'view_laboratory',
                'view_lab_dashboard', 'view_lab_case_registration',
                'create_lab_case_registration', 'view_lab_accept_sample',
                'edit_lab_accept_sample',
            ],
            'lab_technician' => [
                'view_dashboard', 'view_laboratory', 'view_radiology',
                'create_laboratory', 'edit_laboratory',
                'view_lab_dashboard', 'view_lab_case_registration',
                'view_lab_accept_sample', 'view_lab_test_perform',
                'create_lab_test_perform',
            ],
            'lab_supervisor' => array_merge([
                'view_dashboard', 'view_laboratory', 'create_laboratory', 'edit_laboratory',
            ], $labSubPermissions),
            'lab_pathologist' => [
                'view_dashboard', 'view_laboratory',
                'view_lab_dashboard', 'view_lab_test_perform',
                'view_lab_test_approval', 'edit_lab_test_approval',
                'view_lab_patient_reports', 'view_lab_reports',
            ],
            'radiographer' => [
                'view_dashboard', 'view_radiology',
                'create_radiology', 'edit_radiology',
            ],
            'radiologist' => [
                'view_dashboard', 'view_radiology',
                'create_radiology', 'edit_radiology',
            ],
            'accountant' => [
                'view_dashboard', 'view_accounts', 'view_billing',
                'view_payroll', 'view_purchase',
                'create_accounts', 'edit_accounts',
            ],
            'hr_manager' => [
                'view_dashboard', 'view_human_resources', 'view_payroll',
                'view_attendance', 'view_leave_management',
                'create_payroll', 'edit_payroll',
            ],
        ];

        foreach ($rolesConfig as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => $guard]);
            if ($perms === 'all') {
                $role->givePermissionTo(Permission::where('guard_name', $guard)->get());
            } elseif ($perms === 'no_delete') {
                $role->givePermissionTo(Permission::where('guard_name', $guard)->get()->filter(fn ($p) => !str_contains($p->name, 'delete_')));
            } elseif (is_array($perms)) {
                $role->givePermissionTo(
                    Permission::where('guard_name', $guard)->whereIn('name', $perms)->get()
                );
            }
        }

        // Create default admin user if not exists
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@hims.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
            ]
        );

        $superAdminRole = Role::where('name', 'super_admin')->where('guard_name', $guard)->first();
        if ($superAdminRole && !$adminUser->hasRole($superAdminRole)) {
            $adminUser->assignRole($superAdminRole);
        }
    }
}
