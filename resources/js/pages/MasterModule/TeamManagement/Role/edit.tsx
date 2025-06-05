
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import TeamManagementLayout from '../TeamManagementLayout';
import RoleForm from './RoleForm';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: route('setting'),
    },
    {
        title: 'Roles',
        href: route('roles.index'),
    },
    {
        title: 'Edit',
        href: '#',
    },
];

interface Props {
    settingMenu: SettingMenu[];
    permissions: GroupPermission[];
    role:Role
}

export default function editRole({ settingMenu, permissions, role }: Props) {
    return (
        <TeamManagementLayout settingMenu={settingMenu} breadcrumbs={breadcrumbs}>
            <Head title="Edit Role" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4">
                            <div className=" grid grid-cols-1 gap-1">
                                <RoleForm role={role} permissions={permissions}  />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TeamManagementLayout>
    );
}
