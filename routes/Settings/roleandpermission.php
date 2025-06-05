<?php

use App\Http\Controllers\Settings\PermissionController;
use App\Http\Controllers\Settings\RolesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')
->prefix('setting')
->group(function () {
    Route::resource('roles',RolesController::class);
    Route::get('permissions/datatable', [PermissionController::class, 'dataTable'])->name('permissions.datatable');
    Route::resource('permissions',PermissionController::class);
});


