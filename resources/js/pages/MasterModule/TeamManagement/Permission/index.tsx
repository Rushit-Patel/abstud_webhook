
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import DataTable from '../../../../components/DataTable';
import { DataTableProps } from '../../../../types/datatable';
import TeamManagementLayout from '../TeamManagementLayout';
import { getColumns } from './columns';
import CreatePermission from './CreatePermission';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: route('users.index'),
    },
    {
        title: 'Permissions',
        href: route('permissions.index'),
    },
];

const PermissionList: React.FC<DataTableProps> = () => {
    const { props } = usePage<{ settingMenu: SettingMenu[] }>();
    const { settingMenu } = props;
    const [refreshKey, setRefreshKey] = useState(0);
    
    const onSuccess: () => void = () => {
        setRefreshKey(prev => prev + 1);
    };
    
    const columns = getColumns({
        onSuccess,
    });
    
    return (
        <TeamManagementLayout settingMenu={settingMenu} breadcrumbs={breadcrumbs}>
            <Head title="Permissions" />
            <div className="flex flex-col space-y-6">
                {/* DataTable section */}
                <div className="rounded-md border border-gray-100 bg-white overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <h2 className="text-sm font-medium text-gray-900">Permissions</h2>
                        <p className="mt-0.5 text-xs text-gray-500">A list of all Permissions in your organization with their roles and status.</p>
                    </div>
                    <div className="px-4 py-3">
                    <DataTable
                        key={refreshKey}
                        endpoint={route('permissions.datatable')}
                        columns={columns}
                        toolbarContent = {<CreatePermission onSuccess={onSuccess} />}
                    />
                    </div>
                </div>
            </div>
        </TeamManagementLayout>
    );
};

export default PermissionList;