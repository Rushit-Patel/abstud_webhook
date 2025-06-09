<?php
use App\Http\Controllers\Automation\AutomationController;
use App\Http\Controllers\Automation\WorkflowTriggerController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::prefix('automation')
        ->name('automation.')
        ->group(function () {
            Route::get('/', [AutomationController::class, 'index'])->name('index');
            
            // Workflow routes with JSON responses
            Route::get('/workflows/datatable', [AutomationController::class, 'workflows'])->name('workflows.datatable');
            Route::post('/workflows', [AutomationController::class, 'store'])->name('workflows.store');
            Route::put('/workflows/{workflow}', [AutomationController::class, 'update'])->name('workflows.update');
            Route::delete('/workflows/{workflow}', [AutomationController::class, 'destroy'])->name('workflows.destroy');
            
            // Trigger management routes
            Route::post('/workflows/{workflow}/triggers', [WorkflowTriggerController::class, 'store'])->name('workflows.triggers.store');
            Route::put('/workflows/{workflow}/triggers/{trigger}', [WorkflowTriggerController::class, 'update'])->name('workflows.triggers.update');
            Route::delete('/workflows/{workflow}/triggers/{trigger}', [WorkflowTriggerController::class, 'destroy'])->name('workflows.triggers.destroy');
            Route::post('/triggers/validate', [WorkflowTriggerController::class, 'validate'])->name('triggers.validate');
            Route::post('/triggers/test', [WorkflowTriggerController::class, 'test'])->name('triggers.test');
            
            // API endpoints for Facebook integration
            Route::get('/facebook-pages', [AutomationController::class, 'facebookPages'])->name('facebookPages');
            Route::get('/facebook-forms/{pageId}', [AutomationController::class, 'facebookForms'])->name('facebookForms');
            Route::get('/facebook-form-fields/{formId}', [AutomationController::class, 'facebookFormFields'])->name('facebookFormFields');
        });
});