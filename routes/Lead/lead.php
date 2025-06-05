<?php
use App\Http\Controllers\Lead\LeadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::prefix('leads')
        ->name('leads.')
        ->group(function () {
            Route::get('/', [LeadController::class, 'index'])->name('index');
            Route::get('datatable', [LeadController::class, 'datatable'])->name('datatable');
            Route::get('datatable-column', [LeadController::class, 'datatableColumn'])->name('datatable-column');
            
            Route::get('/create', [LeadController::class, 'create'])->name('create');
            Route::get('/{lead}/edit', [LeadController::class, 'edit'])->name('edit');
            Route::delete('/{lead}', [LeadController::class, 'destroy'])->name('destroy');
        });
});
