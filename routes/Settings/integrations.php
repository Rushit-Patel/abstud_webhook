<?php

use App\Http\Controllers\Settings\Integrations\FacebookController;
use App\Http\Controllers\Settings\Integrations\IntegrationsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/integrations/facebook/webhooks', [FacebookController::class, 'verificationWebhooks'])->name('integrations.facebook-webhook.verification');
Route::post('/integrations/facebook/webhooks', [FacebookController::class, 'handleLeadWebhook'])->name('integrations.facebook-webhook.lead');

Route::middleware('auth')->group(function () {
    Route::prefix('integrations')->group(function () {
        Route::get('/', [IntegrationsController::class, 'index'])->name('integrations.index');
        
        Route::get('/facebook-auth', [FacebookController::class, 'redirectToFacebook'])->name('integrations.facebook-auth');
        Route::get('/facebook-auth/callback', [FacebookController::class, 'handleFacebookCallback'])->name('integrations.facebook-auth.callback');
        

        Route::get('/facebook/datatable', [FacebookController::class, 'datatable'])->name('integrations.facebook.datatable');
        Route::get('/facebook/fetch-forms', [FacebookController::class, 'fetchForms'])->name('integrations.facebook.fetch-forms');

        Route::get('/facebook', [IntegrationsController::class, 'facebook'])->name('integrations.facebook');

        Route::get('/lead-fields', [FacebookController::class, 'getLeadFields'])->name('integrations.facebook.lead-fields');    
        Route::get('/form-mappings', [FacebookController::class, 'getFormMappings'])->name('integrations.facebook.form-mappings');
        Route::post('/save-mappings', [FacebookController::class, 'saveMappings'])->name('integrations.facebook.save-mappings');
    });
});
