import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Building, Users, Cable, ChartColumnStacked, Search } from 'lucide-react';
import { useState } from 'react';

interface Props {
    children: React.ReactNode;
    settingMenu: SettingMenu[];
    breadcrumbs?: BreadcrumbItem[];
}

export default function SettingLayout({ children, settingMenu, breadcrumbs }: Props) {
    const [search, setSearch] = useState('');
    const { url } = usePage();

    const filteredMenu = settingMenu.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
        Building: Building,
        Users: Users,
        Cable: Cable,
        ChartColumnStacked: ChartColumnStacked
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />
            <div className="flex flex-1 flex-col bg-gray-50" >
                <div className="flex flex-col md:flex-row flex-1">
                    <div className="md:w-72 w-full overflow-y-auto bg-white border-r border-gray-100 shadow-sm flex-shrink-0" >

                        {/* Search/Header section */}
                        <div className="p-5 border-b border-gray-100">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    placeholder="Search settings..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 bg-gray-50 border-gray-200 text-sm rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-3">
                            {filteredMenu.length > 0 ? (
                                <div className="space-y-1.5">
                                    {filteredMenu.map((item) => {
                                        const Icon = iconMap[item.icon];
                                        const itemPath = new URL(item.link, window.location.origin).pathname;
                                        const isActive = url.includes(itemPath);
                                        
                                        return (
                                            <Link
                                                href={item.link}
                                                key={item.id}
                                                className={`group flex flex-col rounded-lg px-4 py-3 text-sm transition-all ${
                                                    isActive 
                                                        ? 'bg-indigo-50 text-indigo-700' 
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center font-medium">
                                                    {Icon && (
                                                        <Icon 
                                                            className={`mr-3 h-4 w-4 ${
                                                                isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'
                                                            }`} 
                                                        />
                                                    )}
                                                    {item.title}
                                                </div>
                                                <p className={`mt-0.5 text-xs ${
                                                    isActive ? 'text-indigo-600/80' : 'text-gray-500 group-hover:text-gray-600'
                                                }`}>
                                                    {item.desc}
                                                </p>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-sm p-4 rounded-lg bg-gray-50 mt-2">
                                    No results found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-auto p-6">
                            <div className="max-w-5xl mx-auto">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}