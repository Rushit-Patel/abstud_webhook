// useLeadColumns.ts
import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Lead, LeadField } from './columns';
import { generateDynamicColumns } from './columns';

// Custom hook to fetch and manage lead columns
export function useLeadColumns() {
    const [columns, setColumns] = useState<ColumnDef<Lead>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeadFields = async () => {
            try {
                setLoading(true);
                const response = await fetch(route('leads.datatable-column'));

                if (!response.ok) {
                    throw new Error(`Failed to fetch lead fields: ${response.status}`);
                }

                const leadFields: LeadField[] = await response.json();

                // Generate columns based on lead fields
                const dynamicColumns = generateDynamicColumns(leadFields);
                setColumns(dynamicColumns);
            } catch (err) {
                console.error('Error fetching lead fields:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchLeadFields();
    }, []);

    return { columns, loading, error };
}