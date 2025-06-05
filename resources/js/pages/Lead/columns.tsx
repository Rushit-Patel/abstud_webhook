'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Copy, Edit2, Eye, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

// Define the Lead type based on your database schema
export interface Lead {
    id: number;
    raw_payload: Record<string, any>;
    created_at: string;
    updated_at: string;
    // Field values will be joined from lead_field_values
    field_values?: Record<string, any>;
}

// Define the LeadField type based on your database schema
export interface LeadField {
    id: number;
    name: string;
    label: string;
    type: string;
}

// Base columns that are always included
export const baseColumns: ColumnDef<Lead>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
    },
    {
        accessorKey: 'created_at',
        header: 'Date',
        cell: ({ row }) => {
            // Format the date to be more readable
            const date = new Date(row.getValue('created_at'));
            return <div>{date.toLocaleString()}</div>;
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const lead = row.original;

            const copyId = () => {
                navigator.clipboard.writeText(lead.id.toString());
                toast.success('Lead ID copied to clipboard');
            };

            return (
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.visit(`/leads/${lead.id}`)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.visit(`/leads/${lead.id}/edit`)}>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit Lead
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={copyId}>
                                <Copy className="mr-2 h-4 w-4" /> Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>{/* <DeleteLead id={lead.id} /> */}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

// Helper function to render cell based on field type
export const renderCellByType = (fieldName: string, fieldType: string) => {
    return ({ row }: { row: any }) => {
        
        const fieldValues = row.original || {};
        const value = fieldValues[fieldName];

        if (value === undefined || value === null || value === '') {
            return <div>—</div>;
        }

        switch (fieldType) {
            case 'select':
            case 'status':
                return <Badge className={'bg-gray-100 text-gray-800'}>{value}</Badge>;

            case 'date':
                try {
                    const date = new Date(value);
                    return <div>{date.toLocaleDateString()}</div>;
                } catch (e) {
                    return <div>{value}</div>;
                }

            case 'boolean':
                return <div>{value ? '✓' : '✗'}</div>;

            case 'url':
                return (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {value}
                    </a>
                );

            case 'email':
                return (
                    <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
                        {value}
                    </a>
                );

            case 'number':
                return <div className="text-right">{value}</div>;

            case 'textarea':
            case 'text':
            default:
                // Truncate long text
                if (typeof value === 'string' && value.length > 50) {
                    return <div title={value}>{value.substring(0, 50)}...</div>;
                }
                return <div>{value}</div>;
        }
    };
};

// Function to generate dynamic columns from lead fields
export function generateDynamicColumns(fields: LeadField[]): ColumnDef<Lead>[] {
    // Create a new array with base columns
    const dynamicColumns = [...baseColumns];

    // Insert field columns before the actions column (which is the last one)
    fields.forEach((field) => {
        const newColumn: ColumnDef<Lead> = {
            accessorKey: `field_values.${field.name}`,
            header: field.label,
            cell: renderCellByType(field.name, field.type),
        };

        // Insert before actions column
        dynamicColumns.splice(dynamicColumns.length - 1, 0, newColumn);
    });

    return dynamicColumns;
}

// For backward compatibility, export columns
export const columns: ColumnDef<Lead>[] = baseColumns;