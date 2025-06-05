
import { ButtonWithTooltip } from '@/components/ui/button-with-tooltip';
import { type BreadcrumbItem } from '@/types';
import { LeadField } from '@/types/lead';
import { Head } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import LeadManagementLayout from '../LeadManagementLayout';
import CustomFieldDialog from './Components/CustomFieldDialog';
import DataTable from '@/components/DataTable';
import { createColumns } from './columns';

interface Props {
    settingMenu: SettingMenu[];
    leadFields?: LeadField[];
}

// Breadcrumb configuration for the page
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: route('setting'),
    },
    {
        title: 'Lead Management',
        href: route('integrations.index'),
    },
];

export default function CustomFieldsPage({ settingMenu }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<LeadField | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    

    const handleAddField = () => {
        setEditingField(null);
        setIsDialogOpen(true);
    };

    const handleEditField = (field: LeadField) => {
        setEditingField(field);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setRefreshKey(prev => prev + 1);

        setEditingField(null);
    };
    const columns = createColumns(handleEditField);
    return (
        <LeadManagementLayout settingMenu={settingMenu} breadcrumbs={breadcrumbs}>
            <Head title="Custom Fields" /> 
            <div className="flex flex-col space-y-6">
                {/* DataTable section */}
                <div className="rounded-md border border-gray-100 bg-white overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <h2 className="text-sm font-medium text-gray-900">Lead Fields</h2>
                        <p className="mt-0.5 text-xs text-gray-500">Create a custom field to collect specific information from your leads.</p>
                    </div>
                    <DataTable key={refreshKey} endpoint={route('lead-management.lead-fields.datatable')} columns={columns} toolbarContent={
                        <ButtonWithTooltip variant="outline" size="icon" className='p-2 ml-2' tooltip="Add New Field" onClick={handleAddField}>
                            <PlusIcon className="" />
                        </ButtonWithTooltip>
                    } />
                </div>
            </div>
            <CustomFieldDialog isOpen={isDialogOpen} onClose={handleDialogClose} field={editingField} />
        </LeadManagementLayout>
    );
}
