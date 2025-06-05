import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Lead } from '@/types/lead';
import DataTable from '@/components/DataTable';
import { DataTableProps } from '@/types/datatable';
import { useLeadColumns } from './useLeadColumns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: route('dashboard'),
    },
    {
        title: 'Lead',
        href: route('leads.index'),
    },
];

const LeadIndex: React.FC<DataTableProps & Lead> = ({ data }) => {
    const [Leads, setLeads] = useState<Lead[]>([]);
    const { columns, loading, error } = useLeadColumns();

    useEffect(() => {
        setLeads(data);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leads" />
            <div className="flex flex-col space-y-6 p-4">
                <div className="rounded-md border border-gray-100 bg-white overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <h2 className="text-sm font-medium text-gray-900">Leads</h2>
                        <p className="mt-0.5 text-xs text-gray-500">A list of all leads in your organization with their rolesstatus.</p>
                    </div>
                    <DataTable endpoint={route('leads.datatable')} columns={columns} />
                </div>
            </div>
        </AppLayout>
    );
};

export default LeadIndex;