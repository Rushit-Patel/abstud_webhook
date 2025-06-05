'use client';

import { ColumnDef } from '@tanstack/react-table';
import DeleteConfirmation from './DeleteConfirmation';
import EditPermission from './EditPermission';
import DeletePermission from './DeletePermission';


export const getColumns = (callbacks: {
    onSuccess: () => void;
}): ColumnDef<Permission>[] => {

    return [
        {
            accessorKey: 'id',
            header: 'Id',
            cell: ({ row }) => <div>{row.original.id}</div>,
        },
        {
            accessorKey: 'name',
            header: 'Permission',
            cell: ({ row }) => <div>{row.original.name}</div>,
        },
        {
            accessorKey: 'guard_name',
            header: 'Guard Name',
            cell: ({ row }) => <div>{row.original.guard_name}</div>,
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                const permission: Permission = row.original;
                return (
                    
                    <>
                    <div className="flex items-center gap-2">
                        <EditPermission onSuccess={callbacks.onSuccess} permission={permission} />
                        <DeletePermission onSuccess={callbacks.onSuccess} permission={permission} />
                    </div>
                    </>
                );
            },
        },
    ];
};