<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HospitalProfileController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\VisitTypeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // User management
    Route::apiResource('users', UserController::class);
    Route::post('/users/{user}/role', [UserController::class, 'assignRole']);
    Route::put('/users/{user}/roles', [UserController::class, 'updateRoles']);

    // Roles & Permissions management
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('permissions', PermissionController::class)->only(['index']);

    // Hospital Profile
    Route::get('/hospital-profile', [HospitalProfileController::class, 'index']);
    Route::post('/hospital-profile', [HospitalProfileController::class, 'store']);
    Route::put('/hospital-profile', [HospitalProfileController::class, 'update']);
    Route::delete('/hospital-profile', [HospitalProfileController::class, 'destroy']);

    // Patients
    Route::apiResource('patients', PatientController::class);

    // Visit Types
    Route::apiResource('visit-types', VisitTypeController::class);

    // Departments
    Route::apiResource('departments', DepartmentController::class);

    // Doctors
    Route::apiResource('doctors', DoctorController::class);

    // Services
    Route::apiResource('services', ServiceController::class);
});
