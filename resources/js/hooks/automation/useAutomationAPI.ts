import { useState, useCallback } from 'react';
import axios from 'axios';

interface FacebookPage {
    id: string;
    name: string;
    access_token?: string;
    category?: string;
}

interface FacebookForm {
    id: string;
    name: string;
    status?: string;
}

export const useAutomationAPI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apiCall = useCallback(async <T>(
        endpoint: string,
        options: {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
            data?: any;
            params?: any;
        } = {}
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios({
                url: endpoint,
                method: options.method || 'GET',
                data: options.data,
                params: options.params,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchContactFields = useCallback(async (): Promise<string[]> => {
        const result = await apiCall<string[]>('/api/automation/contact-fields');
        return result || [];
    }, [apiCall]);

    const fetchTags = useCallback(async (): Promise<string[]> => {
        const result = await apiCall<string[]>('/api/automation/tags');
        return result || [];
    }, [apiCall]);

    const fetchFacebookPages = useCallback(async (): Promise<FacebookPage[]> => {
        const result = await apiCall<FacebookPage[]>('/api/automation/facebook/pages');
        return result || [];
    }, [apiCall]);

    const fetchFacebookForms = useCallback(async (pageId: string): Promise<FacebookForm[]> => {
        const result = await apiCall<FacebookForm[]>(`/api/automation/facebook/pages/${pageId}/forms`);
        return result || [];
    }, [apiCall]);

    const testWebhook = useCallback(async (url: string, method: string, headers: Record<string, string>, body?: string): Promise<boolean> => {
        const result = await apiCall<{ success: boolean }>('/api/automation/test-webhook', {
            method: 'POST',
            data: { url, method, headers, body },
        });
        return result?.success || false;
    }, [apiCall]);

    return {
        loading,
        error,
        fetchContactFields,
        fetchTags,
        fetchFacebookPages,
        fetchFacebookForms,
        testWebhook,
        clearError: () => setError(null),
    };
};