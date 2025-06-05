<?php

namespace App\Http\Controllers\Settings\LeadManagement;

use App\Models\Integration;
use App\Models\LeadField;
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

class LeadManagement extends Controller
{
    public function index(Request $request): Response
    {
        $settingMenu = new SettingMenuService;
        return Inertia::render('MasterModule/LeadManagement/index', [
            'settingMenu' => $settingMenu->getMenu(),
        ]);
    }
}