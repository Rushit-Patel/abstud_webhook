<?php
use App\Http\Controllers\Automation\AutomationController;
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
            
            // API endpoints for Facebook integration
            Route::get('/facebook-pages', [AutomationController::class, 'facebookPages'])->name('facebookPages');
            Route::get('/facebook-forms/{pageId}', [AutomationController::class, 'facebookForms'])->name('facebookForms');
            Route::get('/facebook-form-fields/{formId}', [AutomationController::class, 'facebookFormFields'])->name('facebookFormFields');
        });
});
