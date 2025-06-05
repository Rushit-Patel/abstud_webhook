import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Edit, KeyRound, Plus } from 'lucide-react';
import TeamManagementLayout from '../TeamManagementLayout';
import RoleCard from './RoleCard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: route('setting'),
    },
    {
        title: 'Roles',
        href: route('roles.index'),
    },
];

interface Props {
    roles: Role[];
    settingMenu: SettingMenu[];
}

export default function Roles({ settingMenu, roles }: Props) {
    return (
        <TeamManagementLayout settingMenu={settingMenu} breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="flex flex-1 flex-col">
                
                {/* Role cards with minimal design */}
                <div className="px-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roles.map((role) => (
                            <Card key={role.id} className="rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <CardHeader className="px-5  border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-medium text-gray-900">{role.name}</CardTitle>
                                        <Badge variant="outline" className="text-xs font-normal text-gray-500 bg-gray-50 border-gray-200">
                                            {role.users_count} {role.users_count === 1 ? 'User' : 'Users'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                
                              
                                <CardFooter className="px-2 py-3 border-gray-100 bg-gray-50">
                                    <Link href={route('roles.edit', role.id)} className="w-full">
                                        <Button variant="ghost" size="sm" className="w-full justify-center text-xs font-medium text-gray-700 hover:bg-gray-100">
                                            Manage
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}

                        {/* Add New Role card with minimal style */}
                        <Link href={route('roles.create')}>
                            <Card className="rounded-lg border border-dashed border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 h-full">
                                <CardContent className="flex flex-col items-center justify-center text-center h-full p-6">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                        <Plus className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">New Role</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </TeamManagementLayout>
    );
}