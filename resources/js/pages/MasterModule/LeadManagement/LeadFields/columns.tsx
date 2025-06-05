'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Clipboard, Copy, Edit2, XCircle } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { ButtonWithTooltip } from '@/components/ui/button-with-tooltip';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LeadField } from '@/types/lead';

export const createColumns = (onEditField: (field: LeadField) => void): ColumnDef<LeadField>[] => [

// export const columns: ColumnDef<LeadField>[] = [
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "label",
        header: "Label",
        cell: ({ row }) => <div>{row.original.label}</div>,
    },
    {
        accessorKey: "name",
        header: 'Name',
        cell: ({ row }) => {
            const copyLabel = () => {
                navigator.clipboard.writeText(row.original.name || '');
                toast.success('Name copied!');
            };
            return (
                <button
                    className="text-blue-600 flex items-center gap-1 underline hover:opacity-75"
                    onClick={copyLabel}
                >
                    <Copy size={12} />
                    {row.original.name}
                </button>
            );
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <div>{row.original.type}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            row.original.is_active ? 
            <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 hover:bg-green-100">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                Active
            </Badge> :
            <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 hover:bg-red-100">
                <XCircle className="w-4 h-4 mr-1 text-red-500" />
                Inactive
            </Badge>
        ),
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const leadField: LeadField = row.original;
            return (
                <>
                    <ButtonWithTooltip
                        variant="ghost"
                        size="icon"
                        tooltip="Edit"
                        onClick={() => onEditField(leadField)}
                    >
                        <Edit2 className="w-4"/>
                    </ButtonWithTooltip>
                </>
            );
        },
    },
];
