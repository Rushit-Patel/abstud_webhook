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
use Illuminate\Support\Facades\Validator;

class PermissionController extends Controller
{
    public function index(): Response
    {
        $settingMenu = new SettingMenuService;
        $roles = Role::get();

        return Inertia::render('MasterModule/TeamManagement/Permission/index', [
            'settingMenu' => $settingMenu->getMenu(),
            'roles' => $roles
        ]);
    }

    public function edit($id): Response
    {
        $settingMenu = new SettingMenuService;
        return Inertia::render('MasterModule/TeamManagement/Users/edit',[
            'settingMenu' => $settingMenu->getMenu()
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:2|max:255|unique:permissions,name',
            'guard_name' => 'required'
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();

        if (isset($request->curd) && $request->curd=='1') {
            $this->createCrudPermissions($validated['name']);
        } else {
            Permission::create([
                'name' => $validated['name'],
                'guard_name' => 'web'
            ]);
        }

        return redirect()->back()->with('success', 'Permission(s) created successfully');
    }

    public function update(Request $request,$id)
    {
        $permission = Permission::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:2|max:255|unique:permissions,name,'.$permission->id,
            'guard_name' => 'required'
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();

        if (isset($request->curd) && $request->curd=='1') {
            $this->createCrudPermissions($validated['name']);
        } else {
            $permission->update([
                'name' => $validated['name'],
                'guard_name' => 'web'
            ]);
        }

        return redirect()->back()->with('success', 'Permission(s) updated successfully');
    }


    public function dataTable(Request $request)
    {
        $dataTable = new DataTableService(Permission::query());

        $permissions = $dataTable->setDefaultSort('id', 'asc')
            ->process($request);

        return response()->json($permissions);
    }

    protected function createCrudPermissions(string $resourceName)
    {
        $actions = ['create', 'read', 'update', 'delete'];
        
        foreach ($actions as $action) {
            Permission::firstOrCreate([
                'name' => "{$resourceName}.{$action}",
                'guard_name' => 'web'
            ]);
        }
    }

    public function destroy($id)
    {
        $permission = Permission::findOrFail($id);
        $permission->delete();

        return redirect()->back()->with('success', 'Permission deleted successfully');
    }

}