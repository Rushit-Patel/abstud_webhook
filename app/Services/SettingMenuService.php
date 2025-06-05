<?php
namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class SettingMenuService
{
    public function getMenu()
    {
        $user = Auth::user();
        $currentRoute = request()->route()->getName();

        return array_filter([
            // [
            //     'id' => 1,
            //     'title' => 'Preferences',
            //     'link' => 'preferences',
            //     'icon' => 'Building',
            //     'desc' => 'Your account, company and general preferences.'
            //     // 'permission' => 'view-dashboard'
            // ],
            [
                'id' => 1,
                'title' => 'Team Management',
                'link' => route('users.index'),
                'icon' => 'Users',
                'desc' => 'Manage all your users.'
                // 'permission' => 'view-users'
            ],
            [
                'id' => 2,
                'title' => 'Integrations',
                'link' => route('integrations.index'),
                'icon' => 'Cable',
                'desc' => 'Facebook integration enables easy lead collection and management in Abstud.'
                // 'permission' => 'view-users'
            ],
            [
                'id' => 3,
                'title' => 'Lead Management',
                'link' => route('lead-management.index'),
                'icon' => 'ChartColumnStacked',
                'desc' => 'Custom Settings lets you tailor the portal to your business needs.'
                // 'permission' => 'view-users'
            ]
        ], function ($item) use ($user) {
            return $this->checkAccess($item, $user);
        });
    }

    protected function checkAccess($item, $user)
    {
        // if (isset($item['role'])) {
        //     return $user->hasRole($item['role']);
        // }

        // if (isset($item['permission'])) {
        //     return $user->can($item['permission']);
        // }

        return true;
    }
}