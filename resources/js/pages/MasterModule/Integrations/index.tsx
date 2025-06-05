import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Facebook } from 'lucide-react';
import IntegrationsLayout from './IntegrationsLayout';
import IntegrationCard from './component/IntegrationCard';
import { useState } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: route('setting'),
    },
    {
        title: 'Integrations',
        href: route('integrations.index'),
    },
];

interface Props {
    settingMenu: SettingMenu[];
    facebook: boolean;
}

export default function Index({ settingMenu, facebook }: Props) {
    const [isFacebookDialogOpen, setIsFacebookDialogOpen] = useState(false);
    return (
        <IntegrationsLayout settingMenu={settingMenu} breadcrumbs={breadcrumbs} >
            <Head title="Integrations" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="">
                            <div className=" grid grid-cols-3 gap-3">
                                <IntegrationCard
                                    icon={Facebook}
                                    title="Facebook"
                                    badgeText="Lead"
                                    description="By integrating Facebook into Abstud CRM, it helps to collect all the leads from Facebook and manage those leads into Abstud CRM."
                                    tooltipText="Setup Facebook integration to get auto lead from within Abstud CRM."
                                    onButtonClick={() => setIsFacebookDialogOpen(true)}
                                    isSetup={facebook}
                                    view = {route('integrations.facebook')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </IntegrationsLayout>
    );
}
