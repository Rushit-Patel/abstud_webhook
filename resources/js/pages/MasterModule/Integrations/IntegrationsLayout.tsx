import { SharedData, type BreadcrumbItem } from '@/types';
import SettingLayout from '../SettingLayout';
import { Link, usePage } from '@inertiajs/react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
    children: React.ReactNode;
    settingMenu: SettingMenu[];
    breadcrumbs?: BreadcrumbItem[];
}

export default function IntegrationsLayout({ children, ...props}: Props) {
    const routeName = route().current();
    const activeTab = 'integrations.index';
    
    return (
        <SettingLayout {...props}>
            <div className="flex flex-1 flex-col">
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
                    <div className="px-4 max-w-screen-2xl mx-auto">
                        <div className="flex items-center space-x-6 h-12 overflow-x-auto">
                            <Link 
                                href={route('integrations.index')}
                                className={`flex items-center h-full border-b-2 px-1 text-sm font-medium ${
                                    route().current() == 'integrations.index'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                All Integrations
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