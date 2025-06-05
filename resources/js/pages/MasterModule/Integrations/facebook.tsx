import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import IntegrationsLayout from './IntegrationsLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FacebookPagesTable } from './component/FacebookPagesTable';
import { FacebookFormsTable } from './component/FacebookFormsTable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: route('setting'),
    },
    {
        title: 'Integrations',
        href: route('integrations.index'),
    },
    {
        title: 'Facebook',
        href: route('integrations.facebook'),
    },
];

interface Props {
    settingMenu: SettingMenu[];
    facebook: Integration;
}

export default function index({ settingMenu, facebook }: Props) {
    return (
        <IntegrationsLayout settingMenu={settingMenu} breadcrumbs={breadcrumbs}>
            <Head title="Integrations" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-1">
                    <div className="">
                        {(() => {
                            try {
                                const creds = JSON.parse(facebook.credentials);
                                return (
                                    <div className="flex w-full items-start gap-4 space-x-4 rounded-xl border p-4 shadow-sm">
                                        <Avatar className="size-10">
                                            <AvatarImage src={creds.avatar} alt="FB" />
                                            <AvatarFallback className="h-10 w-10 rounded-full">FB</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">{facebook.name}</span>
                                            <span className="text-muted-foreground text-sm">Facebook ID : {creds.facebook_id}</span>
                                        </div>
                                        <div className="h-10">
                                            <Separator orientation="vertical" className="bg-muted h-full" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs">
                                                <span className="font-medium">Email:</span> <span className="text-blue-600">{creds.email}</span>
                                            </span>
                                        </div>
                                    </div>
                                );
                            } catch (error) {
                                return <div className="text-red-600">Invalid credentials JSON</div>;
                            }
                        })()}
                    </div>
                    <div className=" py-1">
                        <Tabs defaultValue="pages" className="w-full">
                            <TabsList>
                                <TabsTrigger value="pages">Pages</TabsTrigger>
                                <TabsTrigger value="forms">Forms</TabsTrigger>
                            </TabsList>
                            <TabsContent value="pages">
                                <div className="rounded-xl border my-2 shadow-sm">
                                {(() => {
                                    try {
                                        const meta = JSON.parse(facebook.meta);
                                        return <FacebookPagesTable meta={meta} />;
                                    } catch (error) {
                                        return <div className="text-red-600">Invalid meta format</div>;
                                    }
                                })()}
                                </div>
                            </TabsContent>
                            <TabsContent value="forms">
                                <FacebookFormsTable />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </IntegrationsLayout>
    );
}
