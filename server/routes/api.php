<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HospitalProfileController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientTypeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServiceChargeController;
use App\Http\Controllers\AppointmentMasterController;
use App\Http\Controllers\PatientAppointmentController;
use App\Http\Controllers\OpdVisitController;
use App\Http\Controllers\IpdAdmissionController;
use App\Http\Controllers\EmergencyCaseController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\PharmacyItemController;
use App\Http\Controllers\RadiologyScanController;
use App\Http\Controllers\InsuranceCompanyController;
use App\Http\Controllers\InsurancePlanController;
use App\Http\Controllers\PatientVisitController;
use App\Http\Controllers\BillingDetailController;
use App\Http\Controllers\PatientPaymentController;
use App\Http\Controllers\DoctorShareMasterController;
use App\Http\Controllers\FloorController;
use App\Http\Controllers\RoomsWardsController;
use App\Http\Controllers\BedMasterController;
use App\Http\Controllers\LabHeaderController;
use App\Http\Controllers\LabSubHeaderController;
use App\Http\Controllers\LabRequiredSampleController;
use App\Http\Controllers\LabMasterTestController;
use App\Http\Controllers\LabMasterTestParameterController;
use App\Http\Controllers\LabBoundingController;
use App\Http\Controllers\LabCaseController;
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

    // Patient Types
    Route::apiResource('patient-types', PatientTypeController::class);

    // Departments
    Route::apiResource('departments', DepartmentController::class);

    // Doctors
    Route::apiResource('doctors', DoctorController::class);

    // Services
    Route::apiResource('services', ServiceController::class);

    // Service Charges
    Route::apiResource('service-charges', ServiceChargeController::class);

    // Appointment Master
    Route::apiResource('appointment-master', AppointmentMasterController::class);

    // Patient Appointments
    Route::get('/patient-appointments/slots', [PatientAppointmentController::class, 'getSlots']);
    Route::apiResource('patient-appointments', PatientAppointmentController::class);

    // OPD Visits
    Route::apiResource('opd-visits', OpdVisitController::class);

    // IPD Admissions
    Route::apiResource('ipd-admissions', IpdAdmissionController::class);

    // Emergency Cases
    Route::apiResource('emergency-cases', EmergencyCaseController::class);

    // Billings
    Route::apiResource('billings', BillingController::class);

    // Pharmacy Items
    Route::apiResource('pharmacy-items', PharmacyItemController::class);

    // Radiology Scans
    Route::apiResource('radiology-scans', RadiologyScanController::class);

    // Lab Headers
    Route::apiResource('lab-headers', LabHeaderController::class);

    // Lab Sub Headers
    Route::apiResource('lab-sub-headers', LabSubHeaderController::class);

    // Lab Required Samples
    Route::apiResource('lab-required-samples', LabRequiredSampleController::class);

    // Lab Master Tests
    Route::apiResource('lab-master-tests', LabMasterTestController::class);

    // Lab Master Test Parameters
    Route::apiResource('lab-master-test-parameters', LabMasterTestParameterController::class);

    // Lab Boundings
    Route::apiResource('lab-boundings', LabBoundingController::class);

    // Lab Cases
    Route::get('/lab-cases/waiting-invoices', [LabCaseController::class, 'waitingInvoices']);
    Route::post('/lab-cases/{testId}/results', [LabCaseController::class, 'storeResults']);
    Route::get('/lab-cases/{testId}/results', [LabCaseController::class, 'getResults']);
    Route::put('/lab-cases/tests/{testId}/status', [LabCaseController::class, 'updateTestStatus']);
    Route::apiResource('lab-cases', LabCaseController::class);

    // Insurance Companies
    Route::apiResource('insurance-companies', InsuranceCompanyController::class);

    // Insurance Plans
    Route::apiResource('insurance-plans', InsurancePlanController::class);

    // Patient Visits
    Route::get('/patient-visits/by-visit-no/{visitNo}', [PatientVisitController::class, 'getByVisitNo']);
    Route::get('/patient-visits/by-patient/{patientId}', [PatientVisitController::class, 'getByPatientId']);
    Route::apiResource('patient-visits', PatientVisitController::class);

    // Billing Details
    Route::apiResource('billing-details', BillingDetailController::class);

    // Patient Payments
    Route::get('/patient-payments/advance-balance', [PatientPaymentController::class, 'getAdvanceBalance']);
    Route::post('/patient-payments/apply-advance', [PatientPaymentController::class, 'applyAdvance']);
    Route::post('/patient-payments/refund-advance', [PatientPaymentController::class, 'refundAdvance']);
    Route::apiResource('patient-payments', PatientPaymentController::class);

    // Doctor Share Master
    Route::post('/doctor-share-master/bulk', [DoctorShareMasterController::class, 'bulkStore']);
    Route::delete('/doctor-share-master/bulk', [DoctorShareMasterController::class, 'bulkDestroy']);
    Route::apiResource('doctor-share-master', DoctorShareMasterController::class);

    // Floor Master
    Route::apiResource('floor-master', FloorController::class);

    // Rooms/Wards Master
    Route::apiResource('rooms-wards-master', RoomsWardsController::class);

    // Bed Master
    Route::apiResource('bed-master', BedMasterController::class);
});
