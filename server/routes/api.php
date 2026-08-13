<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HospitalProfileController;
use App\Http\Controllers\PatientController;
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
use App\Http\Controllers\LabOutputSettingController;
use App\Http\Controllers\HospitalOutputSettingController;
use App\Http\Controllers\LabSubHeaderController;
use App\Http\Controllers\LabRequiredSampleController;
use App\Http\Controllers\LabMasterTestController;
use App\Http\Controllers\LabMasterTestParameterController;
use App\Http\Controllers\LabBoundingController;
use App\Http\Controllers\LabCaseController;
use App\Http\Controllers\AcceptSampleController;
use App\Http\Controllers\TestPerformController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // User management (Administration)
    Route::middleware('permission:view_administration')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::get('/roles', [RoleController::class, 'index']);
        Route::get('/roles/{role}', [RoleController::class, 'show']);
        Route::get('/permissions', [PermissionController::class, 'index']);
        Route::get('/hospital-profile', [HospitalProfileController::class, 'index']);
    });

    Route::middleware('permission:create_administration')->group(function () {
        Route::post('/users', [UserController::class, 'store']);
        Route::post('/users/{user}/role', [UserController::class, 'assignRole']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::post('/hospital-profile', [HospitalProfileController::class, 'store']);
    });

    Route::middleware('permission:edit_administration')->group(function () {
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::put('/users/{user}/roles', [UserController::class, 'updateRoles']);
        Route::put('/roles/{role}', [RoleController::class, 'update']);
        Route::put('/hospital-profile', [HospitalProfileController::class, 'update']);
    });

    Route::middleware('permission:delete_administration')->group(function () {
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::delete('/roles/{role}', [RoleController::class, 'destroy']);
        Route::delete('/hospital-profile', [HospitalProfileController::class, 'destroy']);
    });

    // Patients (Registration)
    Route::middleware('permission:view_registration')->get('/patients', [PatientController::class, 'index']);
    Route::middleware('permission:view_registration')->get('/patients/{patient}', [PatientController::class, 'show']);
    Route::middleware('permission:create_registration')->post('/patients', [PatientController::class, 'store']);
    Route::middleware('permission:edit_registration')->put('/patients/{patient}', [PatientController::class, 'update']);
    Route::middleware('permission:delete_registration')->delete('/patients/{patient}', [PatientController::class, 'destroy']);

    // Billings & Financial Payments
    Route::middleware('permission:view_billing')->group(function () {
        Route::get('/billings', [BillingController::class, 'index']);
        Route::get('/billings/{billing}', [BillingController::class, 'show']);
        Route::get('/billing-details', [BillingDetailController::class, 'index']);
        Route::get('/billing-details/{billingDetail}', [BillingDetailController::class, 'show']);
        Route::get('/patient-payments', [PatientPaymentController::class, 'index']);
        Route::get('/patient-payments/advance-balance', [PatientPaymentController::class, 'getAdvanceBalance']);
        Route::get('/patient-payments/{id}', [PatientPaymentController::class, 'show']);
    });

    Route::middleware('permission:create_billing')->group(function () {
        Route::post('/billings', [BillingController::class, 'store']);
        Route::post('/billing-details', [BillingDetailController::class, 'store']);
        Route::post('/patient-payments', [PatientPaymentController::class, 'store']);
        Route::post('/patient-payments/apply-advance', [PatientPaymentController::class, 'applyAdvance']);
        Route::post('/patient-payments/refund-advance', [PatientPaymentController::class, 'refundAdvance']);
    });

    Route::middleware('permission:edit_billing')->group(function () {
        Route::put('/billings/{billing}', [BillingController::class, 'update']);
        Route::put('/billing-details/{billingDetail}', [BillingDetailController::class, 'update']);
        Route::put('/patient-payments/{id}', [PatientPaymentController::class, 'update']);
        Route::put('/patient-payments/{id}/cancel', [PatientPaymentController::class, 'cancel']);
    });

    Route::middleware('permission:delete_billing')->group(function () {
        Route::delete('/billings/{billing}', [BillingController::class, 'destroy']);
        Route::delete('/billing-details/{billingDetail}', [BillingDetailController::class, 'destroy']);
        Route::delete('/patient-payments/{id}', [PatientPaymentController::class, 'destroy']);
    });

    // Master Tables & Departments
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('doctors', DoctorController::class);
    Route::apiResource('services', ServiceController::class);
    Route::apiResource('service-charges', ServiceChargeController::class);
    Route::apiResource('appointment-master', AppointmentMasterController::class);

    // Patient Appointments
    Route::get('/patient-appointments/slots', [PatientAppointmentController::class, 'getSlots']);
    Route::apiResource('patient-appointments', PatientAppointmentController::class);

    // Clinical Modules
    Route::apiResource('opd-visits', OpdVisitController::class);
    Route::apiResource('ipd-admissions', IpdAdmissionController::class);
    Route::apiResource('emergency-cases', EmergencyCaseController::class);

    // Pharmacy & Radiology
    Route::apiResource('pharmacy-items', PharmacyItemController::class);
    Route::apiResource('radiology-scans', RadiologyScanController::class);

    // Laboratory
    Route::apiResource('lab-headers', LabHeaderController::class);
    Route::apiResource('lab-sub-headers', LabSubHeaderController::class);
    Route::apiResource('lab-required-samples', LabRequiredSampleController::class);
    Route::apiResource('lab-master-tests', LabMasterTestController::class);
    Route::apiResource('lab-master-test-parameters', LabMasterTestParameterController::class);
    Route::apiResource('lab-boundings', LabBoundingController::class);

    Route::get('/lab-cases/waiting-invoices', [LabCaseController::class, 'waitingInvoices']);
    Route::post('/lab-cases/{testId}/results', [LabCaseController::class, 'storeResults']);
    Route::get('/lab-cases/{testId}/results', [LabCaseController::class, 'getResults']);
    Route::put('/lab-cases/tests/{testId}/status', [LabCaseController::class, 'updateTestStatus']);
    Route::delete('/lab-cases/{caseId}/tests', [LabCaseController::class, 'removeTests']);
    Route::post('/lab-cases/{caseId}/tests', [LabCaseController::class, 'addTests']);
    Route::apiResource('lab-cases', LabCaseController::class);

    Route::get('/accept-sample', [AcceptSampleController::class, 'index']);
    Route::put('/accept-sample/{testId}/accept', [AcceptSampleController::class, 'acceptSample']);
    Route::put('/accept-sample/{testId}/reject', [AcceptSampleController::class, 'rejectSample']);

    Route::get('/lab-output-settings', [LabOutputSettingController::class, 'show']);
    Route::put('/lab-output-settings', [LabOutputSettingController::class, 'update']);
    Route::post('/lab-output-settings/upload-image', [LabOutputSettingController::class, 'uploadImage']);

    Route::get('/hospital-output-settings', [HospitalOutputSettingController::class, 'show']);
    Route::put('/hospital-output-settings', [HospitalOutputSettingController::class, 'update']);
    Route::post('/hospital-output-settings/upload-image', [HospitalOutputSettingController::class, 'uploadImage']);

    Route::get('/test-perform', [TestPerformController::class, 'index']);
    Route::get('/test-perform/{testId}/parameters', [TestPerformController::class, 'getParameters']);

    // Insurance Companies & Plans
    Route::apiResource('insurance-companies', InsuranceCompanyController::class);
    Route::apiResource('insurance-plans', InsurancePlanController::class);

    // Patient Visits
    Route::get('/patient-visits/by-visit-no/{visitNo}', [PatientVisitController::class, 'getByVisitNo']);
    Route::get('/patient-visits/by-patient/{patientId}', [PatientVisitController::class, 'getByPatientId']);
    Route::apiResource('patient-visits', PatientVisitController::class);

    // Doctor Share Master
    Route::post('/doctor-share-master/bulk', [DoctorShareMasterController::class, 'bulkStore']);
    Route::delete('/doctor-share-master/bulk', [DoctorShareMasterController::class, 'bulkDestroy']);
    Route::apiResource('doctor-share-master', DoctorShareMasterController::class);

    // Infrastructure Master
    Route::apiResource('floor-master', FloorController::class);
    Route::apiResource('rooms-wards-master', RoomsWardsController::class);
    Route::apiResource('bed-master', BedMasterController::class);
});
