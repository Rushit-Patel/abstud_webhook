
import { BreadcrumbItem, User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import TeamManagementLayout from '../TeamManagementLayout';
import UserForm from './UserForm';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Setting',
        href: route('setting'),
    },
    {
        title: 'Users',
        href: route('users.index'),
    },
    {
        title: 'Edit',
        href: '#',
    },
];

interface Props {
    settingMenu: SettingMenu[];
    role: Role[];
    user: User;
}



export default function editUser({ settingMenu, role, user }: Props) {
    
    return (
        <TeamManagementLayout settingMenu={settingMenu} breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4">
                            <div className=" grid grid-cols-1 gap-1">

                                {user ? (
                                    <UserForm user={user} roles={role}  />

                                ) : (
                                    <div>Loading...</div>
                                )}
                                
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </TeamManagementLayout>
    );
}
