import React, { useEffect, useState } from 'react';
import { DataTableProps } from '../../../../types/datatable';
import DataTable from '../../../../components/DataTable';
import { Head, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import SettingLayout from '../../SettingLayout';
import { columns } from './columns';
import { User } from '@/types';
import { Plus, Users } from 'lucide-react';
import TeamManagementLayout from '../TeamManagementLayout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: route('setting'),
    },
    {
        title: 'User',
        href: route('users.index'),
    },
];

interface UserDataProps {
    data: User[];
}

const UsersList: React.FC<DataTableProps & UserDataProps> = ({ data }) => {
    const { props } = usePage<{ settingMenu: SettingMenu[] }>();
    const { settingMenu } = props;
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        setUsers(data);
    }, []);

    return (
        <TeamManagementLayout settingMenu={settingMenu} breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex flex-col space-y-6">
                {/* DataTable section */}
                <div className="rounded-md border border-gray-100 bg-white overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <h2 className="text-sm font-medium text-gray-900">User Accounts</h2>
                        <p className="mt-0.5 text-xs text-gray-500">A list of all users in your organization with their roles and status.</p>
                    </div>
                    <DataTable endpoint={route('users.datatable')} columns={columns} />
                </div>
            </div>
        </TeamManagementLayout>
    );
};

export default UsersList;