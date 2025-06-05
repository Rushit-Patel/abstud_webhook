<?php

use App\Http\Controllers\Settings\SettingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

});

require __DIR__.'/settings.php';
require __DIR__.'/Settings/user.php';
require __DIR__.'/Lead/lead.php';
require __DIR__.'/Automation/automation.php';
require __DIR__.'/Settings/integrations.php';
require __DIR__.'/Settings/lead-management.php';
require __DIR__.'/Settings/roleandpermission.php';
require __DIR__.'/auth.php';
