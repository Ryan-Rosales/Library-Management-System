import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        url: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        url: '/settings/password',
        icon: null,
    },
    {
        title: 'Delete account',
        url: '/settings/delete-account',
        icon: null,
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname;
    const role = usePage<SharedData>().props.auth.user.role;

    const navItems =
        role === 'admin' || role === 'staff'
            ? [
                  ...sidebarNavItems,
                  {
                      title: 'User account control',
                      url: '/settings/user-account-control',
                      icon: null,
                  },
                  ...(role === 'admin'
                      ? [
                            {
                                title: 'Password reset audit',
                                url: '/settings/password-reset-audit',
                                icon: null,
                            },
                        ]
                      : []),
              ]
            : sidebarNavItems;

    return (
        <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f2fbf6_0%,#edf5ff_46%,#f5f8ff_100%)] px-3 py-4 dark:bg-[linear-gradient(130deg,#091512_0%,#0d1a1f_46%,#0f1624_100%)] md:px-5 md:py-5">
            <div className="pointer-events-none absolute left-6 top-0 h-72 w-72 rounded-full bg-[#8ce9c6]/30 blur-3xl dark:bg-[#46aa8f]/18" />

            <div className="relative z-10 flex min-h-full flex-1 rounded-3xl border border-white/70 bg-white/82 p-4 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/12 dark:bg-[#0d1f28cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)] md:p-5">
                <div className="flex w-full flex-col">
                <Heading
                    title="Settings"
                    description={
                        role === 'admin' || role === 'staff'
                            ? 'Manage your profile, account settings, and user account control'
                            : 'Manage your profile and account settings'
                    }
                />

                <div className="mt-5 flex flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
                    <aside className="w-full lg:w-56">
                        <nav className="space-y-1 rounded-2xl border border-[#d5e7df] bg-white/75 p-2 dark:border-white/12 dark:bg-white/6">
                        {navItems.map((item) => (
                            <Button
                                key={item.url}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start rounded-xl font-medium', {
                                    'bg-[#e8f7f1] text-[#205c44] shadow-sm dark:bg-[#14362f] dark:text-[#bcead6]': currentPath === item.url,
                                })}
                            >
                                <Link href={item.url} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                    <Separator className="my-2 md:hidden" />

                    <div className="flex-1 md:max-w-3xl">
                        <section className="space-y-8">{children}</section>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}
