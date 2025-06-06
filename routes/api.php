<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Automation\WorkflowController;
use App\Http\Controllers\Automation\WorkflowTriggerController;



Route::middleware('auth')->group(function () {
    // Workflow routes
    Route::prefix('workflows')->group(function () {
        Route::get('/', [WorkflowController::class, 'index']);
        Route::post('/', [WorkflowController::class, 'store']);
        Route::get('/{workflow}', [WorkflowController::class, 'show']);
        Route::put('/{workflow}', [WorkflowController::class, 'update']);
        Route::delete('/{workflow}', [WorkflowController::class, 'destroy']);
        
        // Trigger management
        Route::post('/{workflow}/triggers', [WorkflowTriggerController::class, 'store']);
        Route::put('/{workflow}/triggers/{trigger}', [WorkflowTriggerController::class, 'update']);
        Route::delete('/{workflow}/triggers/{trigger}', [WorkflowTriggerController::class, 'destroy']);
    });
    
    // Trigger validation and testing
    Route::post('/triggers/validate', [WorkflowTriggerController::class, 'validate']);
    Route::post('/triggers/test', [WorkflowTriggerController::class, 'test']);
});