import { Cog, LayoutGrid, LucideIcon, Settings, Users ,type Icon  } from 'lucide-react';
import * as React from 'react';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import type { NavGroup, NavItem, NavMenu, User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from './app-logo';
import type { SharedData } from '@/types';

const data = {
    navSecondary: [
        {
            title: 'Settings',
            url: route('setting'),
            icon: Settings,
        }
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { menu } = usePage<NavMenu>().props;

    const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
        LayoutGrid: LayoutGrid,
        Users: Users,
        Cog:Cog
    };

    const navMainItems = menu.map((item: NavItem) => ({
        title: item.title,
        url: item.href,
        icon: item.icon ? iconMap[item.icon] : undefined,
        isActive: item.isActive,
    }));
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild 
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMainItems} />
                {/* <NavDocuments items={data.documents} /> */}
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
