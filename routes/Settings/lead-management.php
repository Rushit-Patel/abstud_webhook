<?php

use App\Http\Controllers\Settings\LeadManagement\LeadFieldsController;
use App\Http\Controllers\Settings\LeadManagement\LeadManagement;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::prefix('lead-management')->group(function () {
        Route::get('/', function () {
            return redirect()->route('lead-management.lead-fields.index');
        })->name('lead-management.index');
        Route::prefix('lead-fields')->group(function () {
            Route::get('/', [LeadFieldsController::class, 'index'])->name('lead-management.lead-fields.index');
            Route::get('datatable', [LeadFieldsController::class, 'dataTable'])->name('lead-management.lead-fields.datatable');
            Route::put('lead-fields/update/{leadFieldId}', [LeadFieldsController::class, 'update'])->name('lead-management.lead-fields.update');
            Route::post('lead-fields/store', [LeadFieldsController::class, 'store'])->name('lead-management.lead-fields.store');
            Route::delete('{leadField}/destroy', [LeadFieldsController::class, 'destroy'])->name('lead-management.lead-fields.destroy');
        });    
    });

    Route::prefix('setting')->group(function () {
        
    });
    
});
