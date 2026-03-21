import { NavMain, type NavSection } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowBigLeftDash,
    ArrowLeftRight,
    BarChart3,
    BellRing,
    BookCopy,
    BookMarked,
    FolderKanban,
    History,
    LayoutGrid,
    LibraryBig,
    MapPinHouse,
    NotebookPen,
    Rows3,
    Tag,
    TriangleAlert,
    UserCheck,
    UsersRound,
} from 'lucide-react';
import AppLogo from './app-logo';

function buildNavSections(role: string | undefined, membershipPendingCount: number): NavSection[] {
    if (role === 'member') {
        return [
            {
                title: 'Overview',
                collapsible: false,
                items: [
                    {
                        title: 'Dashboard',
                        url: '/member/dashboard',
                        icon: LayoutGrid,
                    },
                ],
            },
            {
                title: 'Online Catalog',
                collapsible: true,
                items: [
                    {
                        title: 'Search Books',
                        url: '/member/catalog',
                        icon: BookCopy,
                    },
                    {
                        title: 'My Books',
                        url: '/member/my-books',
                        icon: BookMarked,
                    },
                    {
                        title: 'Borrowing History',
                        url: '/member/history',
                        icon: History,
                    },
                    {
                        title: 'Reservations',
                        url: '/member/reservations',
                        icon: UsersRound,
                    },
                    {
                        title: 'Late Fees',
                        url: '/member/penalties',
                        icon: TriangleAlert,
                    },
                ],
            },
        ];
    }

    const dashboardUrl = role === 'staff' ? '/staff/dashboard' : '/dashboard';

    return [
        {
            title: 'Overview',
            collapsible: false,
            items: [
                {
                    title: 'Dashboard',
                    url: dashboardUrl,
                    icon: LayoutGrid,
                },
                {
                    title: 'Reports',
                    url: '/reports',
                    icon: BarChart3,
                },
                {
                    title: 'Team Activity',
                    url: '/team-activity',
                    icon: BellRing,
                },
            ],
        },
        {
            title: 'Catalog',
            collapsible: true,
            items: [
                {
                    title: 'Books',
                    url: '/books',
                    icon: BookCopy,
                },
                {
                    title: 'Categories',
                    url: '/categories',
                    icon: FolderKanban,
                },
                {
                    title: 'Genres',
                    url: '/genres',
                    icon: Tag,
                },
                {
                    title: 'Authors',
                    url: '/authors',
                    icon: NotebookPen,
                },
            ],
        },
        {
            title: 'Inventory',
            collapsible: true,
            items: [
                {
                    title: 'Shelves',
                    url: '/shelves',
                    icon: LibraryBig,
                },
                {
                    title: 'Locations',
                    url: '/locations',
                    icon: MapPinHouse,
                },
                {
                    title: 'Book Copies',
                    url: '/book-copies',
                    icon: Rows3,
                },
            ],
        },
        {
            title: 'Circulation',
            collapsible: true,
            items: [
                {
                    title: 'Borrow',
                    url: '/borrow',
                    icon: ArrowLeftRight,
                },
                {
                    title: 'Return',
                    url: '/return',
                    icon: ArrowBigLeftDash,
                },
                {
                    title: 'History',
                    url: '/history',
                    icon: History,
                },
                {
                    title: 'Penalties',
                    url: '/penalties/manage',
                    icon: TriangleAlert,
                },
            ],
        },
        {
            title: 'People',
            collapsible: true,
            items: [
                {
                    title: 'Members',
                    url: '/members',
                    icon: UsersRound,
                },
                ...(role === 'staff' || role === 'admin'
                    ? [
                          {
                              title: 'Membership Requests',
                              url: '/membership-requests',
                              icon: UsersRound,
                              badgeCount: membershipPendingCount,
                          },
                      ]
                    : []),
                ...(role === 'admin'
                    ? [
                          {
                              title: 'Staff',
                              url: '/staff',
                              icon: UserCheck,
                          },
                      ]
                    : []),
            ],
        },
    ];
}

export function AppSidebar() {
    const page = usePage<SharedData>();
    const role = page.props.auth?.user?.role;
    const membershipPendingCount = Number(page.props.notifications?.membershipPendingCount || 0);
    const navSections: NavSection[] = buildNavSections(role, membershipPendingCount);

    return (
        <Sidebar
            collapsible="icon"
            variant="floating"
            className="sidebar-glass-shell md:p-2 [&_[data-sidebar=sidebar]]:rounded-[24px] [&_[data-sidebar=sidebar]]:border [&_[data-sidebar=sidebar]]:border-white/65 [&_[data-sidebar=sidebar]]:bg-[linear-gradient(170deg,rgba(255,255,255,0.84)_0%,rgba(240,250,255,0.7)_100%)] [&_[data-sidebar=sidebar]]:shadow-[0_28px_68px_rgba(33,77,63,0.28)] [&_[data-sidebar=sidebar]]:backdrop-blur-2xl dark:[&_[data-sidebar=sidebar]]:border-white/18 dark:[&_[data-sidebar=sidebar]]:bg-[linear-gradient(170deg,rgba(13,31,39,0.86)_0%,rgba(11,26,36,0.8)_100%)] dark:[&_[data-sidebar=sidebar]]:shadow-[0_34px_72px_rgba(1,8,13,0.74)]"
        >
            <SidebarHeader className="pb-1">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="group rounded-xl border border-transparent text-sidebar-accent-foreground transition hover:border-border/70 hover:bg-white/68 hover:shadow-[0_10px_22px_rgba(34,76,62,0.12)] dark:hover:bg-white/10"
                        >
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain sections={navSections} />
            </SidebarContent>

            <SidebarFooter className="pt-1">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
