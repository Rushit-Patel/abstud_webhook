import {  type BreadcrumbItem } from '@/types';
import SettingLayout from '../SettingLayout';
import { Link } from '@inertiajs/react';

interface Props {
    children: React.ReactNode;
    settingMenu: SettingMenu[];
    breadcrumbs?: BreadcrumbItem[];
}

export default function LeadManagementLayout({ children, ...props}: Props) {
    // const routeName = route().current();
    // let activeTab = '';
    // if (routeName?.includes('lead-management')) {
    //     activeTab = 'lead-management';
    // } else if (routeName?.includes('lead-fields')) {
    //     activeTab = 'lead-fields';
    // } else if (routeName?.includes('lead-contacts')) {
    //     activeTab = 'lead-contacts';
    // } else {
    //     activeTab = '';
    // }
    return (
        <SettingLayout {...props}>
             <div className="flex flex-1 flex-col">
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
                    <div className="px-4 max-w-screen-2xl mx-auto">
                        <div className="flex items-center space-x-6 h-12 overflow-x-auto">
                            <Link 
                                href={route('lead-management.lead-fields.index')}
                                className={`flex items-center h-full border-b-2 px-1 text-sm font-medium ${
                                    route().current() == 'lead-management.lead-fields.index'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Custom Field
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="mt-4 max-w-screen-2xl mx-auto w-full">
                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                        {children}
                    </div>
                </div>
            </div>
        </SettingLayout>
    );
}