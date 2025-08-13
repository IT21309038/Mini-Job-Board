<?php

use App\Http\Controllers\Api\V1\ApplicationController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EmployerJobController;
use App\Http\Controllers\Api\V1\PublicJobController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/refresh', [AuthController::class, 'refresh']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::middleware('auth:api')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
    });
});

Route::prefix('v1')->group(function () {
    // Public browse
    Route::get('jobs', [PublicJobController::class, 'index']);
    Route::get('jobs/{jobPost}', [PublicJobController::class, 'show']);

    // Employer-auth routes
    Route::middleware(['auth:api'])->group(function () {
        Route::get('employer/jobs', [EmployerJobController::class, 'index']);
        Route::post('employer/jobs', [EmployerJobController::class, 'store']);
        Route::put('employer/jobs/{jobPost}', [EmployerJobController::class, 'update']);
        Route::delete('employer/jobs/{jobPost}', [EmployerJobController::class, 'destroy']);
    });
});

Route::prefix('v1')->middleware(['auth:api'])->group(function () {
    // Candidate
    Route::post('candidate/applications', [ApplicationController::class, 'store']);
    Route::get('candidate/applications', [ApplicationController::class, 'indexForCandidate']);

    // Employer
    Route::get('employer/jobs/{jobPost}/applications', [ApplicationController::class, 'indexForEmployer'])
        ->middleware('can:viewApplicants,jobPost');

    // Private resume download (signed + policy)
    Route::get('applications/{application}/resume', [ApplicationController::class, 'downloadResume'])
        ->name('applications.resume.download')
        ->middleware('signed');
});
