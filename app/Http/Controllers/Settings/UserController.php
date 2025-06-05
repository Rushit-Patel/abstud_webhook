<?php

namespace App\Http\Controllers\Settings;

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

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $settingMenu = new SettingMenuService;
        $dataTable = new DataTableService(User::query());

        $users = $dataTable->setDefaultSort('id', 'asc')
            ->process($request);

        return Inertia::render('MasterModule/TeamManagement/Users/index', [
            'settingMenu' => $settingMenu->getMenu(),
            'data' => $users
        ]);
    }

    public function create(): Response
    {
        $settingMenu = new SettingMenuService;
        return Inertia::render('MasterModule/TeamManagement/Users/edit', [
            'settingMenu' => $settingMenu->getMenu(),
            'user' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->syncRoles($request->input('roles', []));

        return redirect()->route('users.index')->with('success', 'User created successfully!');
    }

    public function edit($id): Response
    {
        $settingMenu = new SettingMenuService;
        $user = User::with('roles')->findOrFail($id);
        $roles = Role::get();
        return Inertia::render('MasterModule/TeamManagement/Users/edit', [
            'settingMenu' => $settingMenu->getMenu(),
            'user' => $user,
            'role' => $roles,
        ]);
    }

    public function update(Request $request, $id): RedirectResponse
    {  
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'roles' => 'required|array',
        ]);

        $user->update($validated);
        $user->syncRoles($validated['roles'] ?? []);

        return redirect()->route('users.index')->with('success', 'User updated successfully!');
    }
    public function dataTable(Request $request)
    {
        $users = User::query()
            ->with('roles');
        $dataTable = new DataTableService($users);

        $users = $dataTable->setDefaultSort('id', 'asc')
            ->process($request);

        return response()->json($users);
    }

    public function destroy($id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully!');
    }
}