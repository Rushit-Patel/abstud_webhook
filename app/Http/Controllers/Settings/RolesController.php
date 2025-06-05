<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SettingMenuService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\DataTableService;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesController extends Controller
{
    public function index(): Response
    {
        $settingMenu = new SettingMenuService;
        $roles = Role::withCount('users')->get();
        return Inertia::render('MasterModule/TeamManagement/Role/index', [
            'settingMenu' => $settingMenu->getMenu(),
            'roles' => $roles
        ]);
    }


    public function create(): Response
    {
        $settingMenu = new SettingMenuService;
        $permissions = Permission::get();
        $groupedPermissions = $permissions
            ->groupBy(function ($permission) {
                return explode('.', $permission->name)[0];
            })
            ->map(function ($items, $key) {
                return [
                    'permission' => $key,
                    'list' => $items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'guard_name' => $item->guard_name,
                        ];
                    })->values(),
                ];
            })
            ->values();
        return Inertia::render('MasterModule/TeamManagement/Role/create',[
            'settingMenu' => $settingMenu->getMenu(),
            'permissions' => $groupedPermissions
        ]);
    }

    public function edit($id): Response
    {
        $role = Role::with('permissions')->findOrFail($id);

        $settingMenu = new SettingMenuService;
        $permissions = Permission::get();
        $groupedPermissions = $permissions
            ->groupBy(function ($permission) {
                return explode('.', $permission->name)[0];
            })
            ->map(function ($items, $key) {
                return [
                    'permission' => $key,
                    'list' => $items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'guard_name' => $item->guard_name,
                        ];
                    })->values(),
                ];
            })
            ->values();
        return Inertia::render('MasterModule/TeamManagement/Role/edit', [
            'settingMenu' => $settingMenu->getMenu(),
            'permissions' => $groupedPermissions,
            'role' => $role
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'guard_name' => 'required|string|max:255',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'exists:permissions,id'
        ]);

        // Create the role
        $role = Role::create($validated);

        // Sync permissions
        if (isset($validated['permissions'])) {
            $permissions = Permission::whereIn('id', $validated['permissions'])->pluck('name');
            $role->syncPermissions($permissions);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully!');
    }

    public function update(Request $request, $id): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $id,
            'guard_name' => 'required|string|max:255',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'exists:permissions,id'
        ]);
    
        $role = Role::findOrFail($id);
        $role->update($validated);
    
        // Sync permissions
        if (isset($validated['permissions'])) {
            $permissions = Permission::whereIn('id', $validated['permissions'])->pluck('name');
            $role->syncPermissions($permissions);
        } else {
            // Clear permissions if none are selected
            $role->syncPermissions([]);
        }
    
        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully!');
    }
    
    public function destroy($id): \Illuminate\Http\RedirectResponse
    {
        $role = Role::findOrFail($id);
        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Role deleted successfully!');
    }
}