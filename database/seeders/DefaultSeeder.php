<?php

namespace Database\Seeders;

use App\Models\IntegrationType;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;

class DefaultSeeder extends Seeder
{
    public function run()
    {
        // Create Admin Role if not exists
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);

        // (Optional) Create some permissions and assign to Admin
        $permissions = [
            'users.create',
            'users.edit',
            'users.view',
            'users.delete',
            'role.create',
            'role.edit',
            'role.view',
            'role.delete',
            'permission.create',
            'permission.edit',
            'permission.view',
            'permission.delete',
            'integrations'
        ];

        foreach ($permissions as $permission) {
            $perm = Permission::firstOrCreate(['name' => $permission]);
            $adminRole->givePermissionTo($perm);
        }

        // Create Admin User
        $admin = User::firstOrCreate([
            'email' => 'admin@abstud.io',
        ], [
            'name' => 'Admin',
            'mobile' => '9999999999',
            'username' => 'admin',
            'password' => Hash::make('password'),  
            'base_password' => base64_encode('password'), 
            'email_verified_at' => now(),
        ]);

        // Assign Admin role to the user
        if (!$admin->hasRole('Admin')) {
            $admin->assignRole('Admin');
        }

        // create integration default type

        IntegrationType::firstOrCreate([
            'name' => 'Facebook Lead',
            'slug' => 'facebook-lead',
            'auth_config' => json_encode([
                'auth_type' => 'webhook',
                'scopes' => [
                    'leads_retrieval',
                    'pages_show_list',
                    'pages_manage_ads',
                    'pages_read_engagement',
                    'pages_manage_metadata',
                    'email',
                    'business_management'
                ],
            ]),
        ]);
    }
}
