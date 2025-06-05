<?php

namespace App\Http\Controllers\Settings\Integrations;

use App\Models\Integration;
use Auth;
use Illuminate\Support\Facades\Hash;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SettingMenuService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\DataTableService;
use Spatie\Permission\Models\Role;

class IntegrationsController extends Controller
{
    public function index(Request $request): Response
    {
        $settingMenu = new SettingMenuService;
        $integrationFacebook = Integration::where('user_id', Auth::user()->id)
                            ->where('type_id', '1')
                            ->first();
        if(!empty($integrationFacebook)){
            $facebook = true;
        }else{
            $facebook = false;
        }                  

        return Inertia::render('MasterModule/Integrations/index', [
            'settingMenu' => $settingMenu->getMenu(),
            'facebook' => $facebook,
        ]);
    }

    public function facebook():Response
    {
        $settingMenu = new SettingMenuService;
        $integrationFacebook = Integration::where('user_id', Auth::user()->id)
                            ->where('type_id', '1')
                            ->first();  
        return Inertia::render('MasterModule/Integrations/facebook', [
            'settingMenu' => $settingMenu->getMenu(),
            'facebook' => $integrationFacebook,
        ]);
    } 
}