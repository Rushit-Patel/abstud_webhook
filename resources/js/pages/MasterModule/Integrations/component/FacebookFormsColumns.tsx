'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeftRight, CheckCircle, Component, XCircle } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { ButtonWithTooltip } from '@/components/ui/button-with-tooltip';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import FacebookFieldMappingDialog from './FacebookFieldMappingDialog';

// Separate component at the bottom or in a separate file
function FacebookFormActions({ facebookForm,onMappingSaved }: { facebookForm: FacebookForm, onMappingSaved: () => void; }) {
    const [mappingDialogOpen, setMappingDialogOpen] = useState(false);


    return (
        <>
            <ButtonWithTooltip
                variant="ghost"
                size="icon"
                tooltip="Map Form Fields"
                onClick={() => setMappingDialogOpen(true)}
            >
                <ArrowLeftRight className="w-4 h-4" />
            </ButtonWithTooltip>

            {mappingDialogOpen && (
                <FacebookFieldMappingDialog
                    open={mappingDialogOpen}
                    onClose={() => setMappingDialogOpen(false)}
                    formId={facebookForm.facebook_form_id}
                    formName={facebookForm.form_name}
                    questions={facebookForm.questions || ''}
                    existingMappings={facebookForm.field_mappings}
                    onMappingSaved={onMappingSaved}
                />
            )}
        </>
    );
}
export const columns = (
    onMappingSaved: () => void
): ColumnDef<FacebookForm>[] => [
    {
        accessorKey: "form_name",
        header: "Name",
        cell: ({ row }) => <div>{row.original.form_name}</div>,
    },
    {
        accessorKey: "facebook_form_id",
        header: "Form Id",
        cell: ({ row }) => <div>{row.original.facebook_form_id}</div>,
    },
    {
        accessorKey: "facebook_page_id",
        header: 'Page',
        cell: ({ row }) => <div>{row.original.facebook_page_id}</div>,
    },
    {
        accessorKey: "mapping",
        header: 'Mapping',
        cell: ({ row }) => (
            row.original.field_mappings_count > 0 ? (
                <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 hover:bg-green-100">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    Done
                </Badge>
            ) : (
                <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 hover:bg-red-100">
                    <XCircle className="w-4 h-4 mr-1 text-red-500" />
                    Pending
                </Badge>
            )
        ),
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => <FacebookFormActions facebookForm={row.original} onMappingSaved={onMappingSaved}/>,
    },
];