<?php
namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class MenuService
{
    public function getMenu()
    {
        $user = Auth::user();
        $currentRoute = request()->route()->getName();

        return array_filter([
            [
                'title' => 'Dashboard',
                'href' => route('dashboard'),
                'icon' => 'LayoutGrid',
                'isActive' => $currentRoute === 'dashboard',
                // 'permission' => 'view-dashboard'
            ],
            [
                'title' => 'Leads',
                'href' => route('leads.index'),
                'icon' => 'Users',
                'isActive' => $currentRoute === 'leads.index',
                // 'permission' => 'view-users'
            ],
            [
                'title' => 'Automation',
                'href' => route('automation.index'),
                'icon' => 'Cog',
                'isActive' => $currentRoute === 'automation.index',
                // 'permission' => 'view-users'
            ]
        ], function ($item) use ($user) {
            return $this->checkAccess($item, $user);
        });
    }

    protected function checkAccess($item, $user)
    {
        if (isset($item['role'])) {
            return $user->hasRole($item['role']);
        }

        if (isset($item['permission'])) {
            return $user->can($item['permission']);
        }

        return true;
    }
}