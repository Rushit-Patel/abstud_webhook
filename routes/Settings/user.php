<?php

use App\Http\Controllers\Settings\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::prefix('setting')->group(function () {
        Route::get('/', function () {
            return redirect()->route('users.index');
        })->name('setting');
    });
    Route::prefix('users')->group(function () {
        Route::get('datatable', [UserController::class, 'dataTable'])->name('users.datatable');
        Route::get('/', [UserController::class, 'index'])->name('users.index');
        Route::get('create', [UserController::class, 'create'])->name('users.create');
        Route::post('store', [UserController::class, 'store'])->name('users.store');
        Route::get('{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('{user}/update', [UserController::class, 'update'])->name('users.update');
        Route::delete('{user}/destroy', [UserController::class, 'destroy'])->name('users.destroy');
    });
});
