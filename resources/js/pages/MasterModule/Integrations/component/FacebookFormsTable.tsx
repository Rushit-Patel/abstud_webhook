import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { columns } from './FacebookFormsColumns';

interface FacebookFormsResponse {
    success: boolean;
    message: string;
}
export const FacebookFormsTable: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleFetchForms = useCallback(async () => {
        toast.loading('Fetching Facebook forms...', { id: 'fetching' });

        try {
            const response = await axios.get<FacebookFormsResponse>(route('integrations.facebook.fetch-forms'));

            if (response.data.success) {
                setRefreshKey((prev) => prev + 1);
                toast.success('Forms fetched successfully!', { id: 'fetching' });
            } else {
                toast.error(response.data.message || 'Failed to fetch forms', { id: 'fetching' });
            }
        } catch (error) {
            toast.error('Failed to fetch Facebook forms', { id: 'fetching' });
        }
    }, []);

    const handleMappingSaved = () => {
        setRefreshKey((prev) => prev + 1);
    };
    
    return (
        <div className="w-full overflow-x-auto">
            <DataTable
                key={refreshKey}
                endpoint={route('integrations.facebook.datatable')}
                columns={columns(handleMappingSaved)}
                toolbarContent={
                    <Button variant="outline" size="sm" onClick={handleFetchForms}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                }
            />
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-medium text-gray-700">Instructions:</h3>
                <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-600">
                    <li>Click the "Fetch Forms" button to retrieve your Facebook Lead Forms</li>
                    <li>For each form, click the mapping icon to configure how form fields map to your CRM fields</li>
                    <li>Once mapped, leads from those forms will automatically be imported into your CRM</li>
                </ol>
            </div>
        </div>
    );
};
