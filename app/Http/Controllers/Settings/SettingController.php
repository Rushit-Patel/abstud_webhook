<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\DataTableService;

class SettingController extends Controller
{
    public function index(): Response
    {
        $settingMenu = [
            [
                'id' => 1,
                'title' => 'Preferences',
                'link' => 'preferences',
                'icon' => 'Building',
                'desc' => 'Your account, company and general preferences.'
            ],
            [
                'id' => 2,
                'title' => 'Team  Management',
                'link' => 'team-management',
                'icon' => 'Users',
                'desc' => 'Manage all your users.'
            ]
        ]; 
        return Inertia::render('MasterModule/index',[
            'settingMenu' => $settingMenu
        ]);
    }
}