import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface NavSection {
    title: string;
    items: NavItem[];
    collapsible?: boolean;
}

export function NavMain({ sections = [] }: { sections: NavSection[] }) {
    const page = usePage();
    const [openState, setOpenState] = useState<Record<string, boolean>>({});
    const storageKey = 'sidebar:nav:collapsible-state';

    const isSectionOpen = (items: NavItem[]) => items.some((item) => page.url === item.url || page.url.startsWith(`${item.url}/`));

    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(storageKey);
            if (saved) {
                setOpenState(JSON.parse(saved));
            }
        } catch {
            // Ignore corrupt localStorage values.
        }
    }, []);

    const resolveOpen = (section: NavSection) => {
        const routeOpen = isSectionOpen(section.items);
        if (routeOpen) {
            return true;
        }

        // Keep Catalog open by default, but still allow collapsing and remember the choice.
        if (section.title === 'Catalog') {
            return openState[section.title] ?? true;
        }

        // Default to open on first visit, then respect user preference from localStorage.
        return openState[section.title] ?? true;
    };

    const setSectionOpen = (title: string, open: boolean) => {
        setOpenState((previous) => {
            const next = { ...previous, [title]: open };

            try {
                window.localStorage.setItem(storageKey, JSON.stringify(next));
            } catch {
                // Ignore localStorage write failures.
            }

            return next;
        });
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="hidden text-[10px] font-semibold tracking-[0.13em] text-[#4e6f64] group-data-[collapsible=icon]:hidden dark:text-[#8baea2]">
                Navigation
            </SidebarGroupLabel>

            {sections.map((section) => {
                const open = resolveOpen(section) || section.title === 'Overview';
                const isCollapsible = section.collapsible ?? true;

                const menuItems = (
                    <SidebarMenu>
                        {section.items.map((item) => (
                            <SidebarMenuItem key={`${section.title}-${item.title}`}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={item.url === page.url}
                                    className="group/nav relative h-9 rounded-xl border border-transparent bg-transparent px-3 text-[12px] text-[#335146] transition-all duration-300 before:absolute before:left-0 before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0_0_15px_2px_rgba(52,190,130,0.8)] before:transition-all before:duration-300 hover:border-[#d5e7de] hover:bg-white/64 hover:text-[#224437] hover:shadow-[0_12px_25px_rgba(43,90,74,0.12)] dark:text-[#9cc0b3] dark:hover:border-white/18 dark:hover:bg-white/10 dark:hover:text-[#d7f7e9] dark:hover:shadow-[0_16px_30px_rgba(2,12,12,0.4)] data-[active=true]:border-[#8fdcc0] data-[active=true]:bg-[linear-gradient(105deg,rgba(231,251,241,0.92)_0%,rgba(231,245,255,0.86)_100%)] data-[active=true]:text-[#1b5d45] data-[active=true]:shadow-[0_14px_34px_rgba(45,140,102,0.22)] data-[active=true]:before:bg-[#39b57f] data-[active=true]:before:opacity-100 dark:data-[active=true]:border-[#4f9f85] dark:data-[active=true]:bg-[linear-gradient(105deg,rgba(21,56,47,0.9)_0%,rgba(20,48,68,0.84)_100%)] dark:data-[active=true]:text-[#b6edd6]"
                                >
                                    <Link href={item.url} prefetch>
                                        {item.icon && <item.icon />}
                                        <span className="flex min-w-0 items-center justify-between gap-2">
                                            <span className="truncate">
                                                {item.title}
                                                {Number(item.badgeCount || 0) > 0 && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#e53935] align-middle" />}
                                            </span>
                                            {Number(item.badgeCount || 0) > 0 && (
                                                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#e53935] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm">
                                                    {item.badgeCount}
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                );

                if (!isCollapsible) {
                    return (
                        <div key={section.title} className="mt-1">
                            <div className="mb-1 px-2 py-1 text-left text-[10px] font-semibold tracking-[0.12em] text-[#5f8074] group-data-[collapsible=icon]:hidden dark:text-[#83a69a]">
                                {section.title.toUpperCase()}
                            </div>
                            <div className="space-y-1">{menuItems}</div>
                        </div>
                    );
                }

                return (
                    <Collapsible key={section.title} open={open} onOpenChange={(nextOpen) => setSectionOpen(section.title, nextOpen)} className="mt-1">
                        <CollapsibleTrigger className="group/folder mb-1 flex w-full items-center justify-between rounded-lg border border-transparent px-2 py-1 text-left text-[10px] font-semibold tracking-[0.12em] text-[#5f8074] transition hover:border-[#d5e7de]/80 hover:bg-white/58 hover:text-[#2d5445] group-data-[collapsible=icon]:hidden dark:text-[#83a69a] dark:hover:border-white/12 dark:hover:bg-white/8 dark:hover:text-[#caeedf]">
                            <span>{section.title.toUpperCase()}</span>
                            <ChevronDown className="h-4 w-4 transition duration-200 group-data-[state=open]/folder:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1">{menuItems}</CollapsibleContent>
                    </Collapsible>
                );
            })}
        </SidebarGroup>
    );
}
